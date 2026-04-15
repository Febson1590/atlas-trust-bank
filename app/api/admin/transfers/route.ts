import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { adminTransferActionSchema } from "@/lib/validations";
import { generateReference, formatCurrency } from "@/lib/utils";
import { sendTransferAlertEmail } from "@/lib/email";
import { Prisma } from "@/generated/prisma";

// ─── GET — Fetch all transfers with related data ────────────────
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * limit;

    const where = status ? { status: status as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REJECTED" } : {};

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          fromAccount: {
            select: {
              id: true,
              accountNumber: true,
              label: true,
              currency: true,
              balance: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          toAccount: {
            select: {
              id: true,
              accountNumber: true,
              label: true,
            },
          },
          beneficiary: {
            select: {
              name: true,
              bankName: true,
              accountNumber: true,
            },
          },
        },
      }),
      prisma.transfer.count({ where }),
    ]);

    const serialized = transfers.map((t) => ({
      id: t.id,
      fromAccountId: t.fromAccountId,
      toAccountId: t.toAccountId,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      reference: t.reference,
      description: t.description,
      recipientName: t.recipientName,
      recipientBank: t.recipientBank,
      recipientAcct: t.recipientAcct,
      adminNote: t.adminNote,
      processedBy: t.processedBy,
      processedAt: t.processedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
      fromAccount: {
        ...t.fromAccount,
        balance: Number(t.fromAccount.balance),
      },
      toAccount: t.toAccount,
      beneficiary: t.beneficiary,
    }));

    return NextResponse.json({
      success: true,
      data: serialized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin fetch transfers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

// ─── PUT — Process transfer (approve/reject/delay) ──────────────
export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = adminTransferActionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { transferId, action, adminNote } = result.data;

    // Fetch transfer with related data
    const transfer = await prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        fromAccount: {
          include: {
            user: {
              select: { id: true, firstName: true, email: true },
            },
          },
        },
        toAccount: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { success: false, error: "Transfer not found" },
        { status: 404 }
      );
    }

    if (transfer.status !== "PENDING" && transfer.status !== "PROCESSING") {
      return NextResponse.json(
        { success: false, error: `Transfer is already ${transfer.status.toLowerCase()}` },
        { status: 400 }
      );
    }

    const ipAddress = getClientIP(request);

    if (action === "approve") {
      // Atomic: update transfer, debit source, optionally credit destination, create transactions
      await prisma.$transaction(async (tx) => {
        const sourceAccount = await tx.account.findUnique({
          where: { id: transfer.fromAccountId },
        });

        if (!sourceAccount) throw new Error("Source account not found");

        const currentBalance = Number(sourceAccount.balance);
        const amount = Number(transfer.amount);

        if (currentBalance < amount) {
          throw new Error("Insufficient balance in source account");
        }

        const newSourceBalance = currentBalance - amount;

        // Debit source account
        await tx.account.update({
          where: { id: transfer.fromAccountId },
          data: { balance: new Prisma.Decimal(newSourceBalance) },
        });

        // Flip the existing PENDING debit (created at submit time) to
        // COMPLETED and record the actual post-debit balance. Previously
        // the approve handler *also* inserted a brand-new COMPLETED debit,
        // which meant every approved transfer showed up twice in the
        // user's transaction history.
        const pendingDebits = await tx.transaction.updateMany({
          where: {
            accountId: transfer.fromAccountId,
            status: "PENDING",
            metadata: { path: ["transferId"], equals: transfer.id },
          },
          data: {
            status: "COMPLETED",
            balanceAfter: new Prisma.Decimal(newSourceBalance),
          },
        });

        // Safety net: if no pending debit was found (e.g. manual DB edit
        // or data integrity issue), create the debit tx now so there's
        // always exactly one COMPLETED record of this transfer.
        if (pendingDebits.count === 0) {
          await tx.transaction.create({
            data: {
              accountId: transfer.fromAccountId,
              type: "DEBIT",
              amount: new Prisma.Decimal(amount),
              status: "COMPLETED",
              reference: generateReference("TXN"),
              description: `Transfer to ${transfer.recipientName || "recipient"} — ${transfer.reference}`,
              category: "Transfer",
              balanceAfter: new Prisma.Decimal(newSourceBalance),
              metadata: {
                transferId: transfer.id,
                transferReference: transfer.reference,
                approvedBy: session.userId,
                reconstructed: true,
              },
            },
          });
        }

        // If toAccountId exists, credit that account
        if (transfer.toAccountId && transfer.toAccount) {
          const destAccount = await tx.account.findUnique({
            where: { id: transfer.toAccountId },
          });

          if (destAccount) {
            const newDestBalance = Number(destAccount.balance) + amount;

            await tx.account.update({
              where: { id: transfer.toAccountId },
              data: { balance: new Prisma.Decimal(newDestBalance) },
            });

            await tx.transaction.create({
              data: {
                accountId: transfer.toAccountId,
                type: "CREDIT",
                amount: new Prisma.Decimal(amount),
                status: "COMPLETED",
                reference: generateReference("TXN"),
                description: `Transfer from ${sourceAccount.accountNumber} — ${transfer.reference}`,
                category: "Transfer",
                balanceAfter: new Prisma.Decimal(newDestBalance),
                metadata: {
                  transferId: transfer.id,
                  transferReference: transfer.reference,
                },
              },
            });
          }
        }

        // Update transfer status
        await tx.transfer.update({
          where: { id: transferId },
          data: {
            status: "COMPLETED",
            adminNote: adminNote || null,
            processedBy: session.userId,
            processedAt: new Date(),
          },
        });
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "APPROVE_TRANSFER",
          targetType: "Transfer",
          targetId: transferId,
          details: {
            reference: transfer.reference,
            amount: Number(transfer.amount),
            adminNote,
          },
          ipAddress,
        },
      });

      // Send email notification (non-blocking)
      sendTransferAlertEmail(
        transfer.fromAccount.user.email,
        transfer.fromAccount.user.firstName,
        {
          amount: formatCurrency(Number(transfer.amount), transfer.currency),
          recipient: transfer.recipientName || "Recipient",
          reference: transfer.reference,
          status: "completed",
        }
      ).catch(console.error);

      return NextResponse.json({ success: true, message: "Transfer approved" });
    }

    if (action === "reject") {
      await prisma.$transaction(async (tx) => {
        // Update transfer
        await tx.transfer.update({
          where: { id: transferId },
          data: {
            status: "REJECTED",
            adminNote: adminNote || null,
            processedBy: session.userId,
            processedAt: new Date(),
          },
        });

        // Mark any pending transactions as FAILED
        await tx.transaction.updateMany({
          where: {
            accountId: transfer.fromAccountId,
            status: "PENDING",
            metadata: { path: ["transferId"], equals: transfer.id },
          },
          data: { status: "FAILED" },
        });
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "REJECT_TRANSFER",
          targetType: "Transfer",
          targetId: transferId,
          details: {
            reference: transfer.reference,
            amount: Number(transfer.amount),
            adminNote,
          },
          ipAddress,
        },
      });

      sendTransferAlertEmail(
        transfer.fromAccount.user.email,
        transfer.fromAccount.user.firstName,
        {
          amount: formatCurrency(Number(transfer.amount), transfer.currency),
          recipient: transfer.recipientName || "Recipient",
          reference: transfer.reference,
          status: "rejected",
        }
      ).catch(console.error);

      return NextResponse.json({ success: true, message: "Transfer rejected" });
    }

    if (action === "delay") {
      await prisma.transfer.update({
        where: { id: transferId },
        data: {
          status: "PROCESSING",
          adminNote: adminNote || null,
          processedBy: session.userId,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "DELAY_TRANSFER",
          targetType: "Transfer",
          targetId: transferId,
          details: {
            reference: transfer.reference,
            amount: Number(transfer.amount),
            adminNote,
          },
          ipAddress,
        },
      });

      sendTransferAlertEmail(
        transfer.fromAccount.user.email,
        transfer.fromAccount.user.firstName,
        {
          amount: formatCurrency(Number(transfer.amount), transfer.currency),
          recipient: transfer.recipientName || "Recipient",
          reference: transfer.reference,
          status: "processing",
        }
      ).catch(console.error);

      return NextResponse.json({ success: true, message: "Transfer delayed for processing" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process transfer";
    console.error("Admin transfer action error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
