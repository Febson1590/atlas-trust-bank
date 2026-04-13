import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { transferSchema } from "@/lib/validations";
import { generateReference, formatCurrency } from "@/lib/utils";
import { sendTransferAlertEmail } from "@/lib/email";
import { Prisma } from "@/generated/prisma";

// ─── GET — Fetch user's transfers ────────────────────────────
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all user account IDs
    const accounts = await prisma.account.findMany({
      where: { userId: session.userId },
      select: { id: true },
    });

    const accountIds = accounts.map((a) => a.id);

    if (accountIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const transfers = await prisma.transfer.findMany({
      where: { fromAccountId: { in: accountIds } },
      orderBy: { createdAt: "desc" },
      include: {
        fromAccount: {
          select: {
            accountNumber: true,
            label: true,
            currency: true,
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
    });

    const serialized = transfers.map((t) => ({
      id: t.id,
      fromAccountId: t.fromAccountId,
      fromAccount: t.fromAccount,
      beneficiaryId: t.beneficiaryId,
      beneficiary: t.beneficiary,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      reference: t.reference,
      description: t.description,
      recipientName: t.recipientName,
      recipientBank: t.recipientBank,
      recipientAcct: t.recipientAcct,
      createdAt: t.createdAt.toISOString(),
      processedAt: t.processedAt?.toISOString() ?? null,
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error("Fetch transfers error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transfers" },
      { status: 500 }
    );
  }
}

// ─── POST — Create a new transfer ───────────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const result = transferSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return NextResponse.json(
        { success: false, error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const { fromAccountId, recipientName, recipientBank, recipientAcct, amount, description } =
      result.data;

    // Check user KYC status
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        firstName: true,
        email: true,
        kycStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (user.kycStatus !== "VERIFIED") {
      return NextResponse.json(
        {
          success: false,
          error: "KYC verification required. Please complete your identity verification before making transfers.",
        },
        { status: 403 }
      );
    }

    // Check source account belongs to user and is active
    const sourceAccount = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: session.userId,
      },
    });

    if (!sourceAccount) {
      return NextResponse.json(
        { success: false, error: "Source account not found" },
        { status: 404 }
      );
    }

    // Check account status
    if (sourceAccount.status === "DORMANT") {
      return NextResponse.json(
        {
          success: false,
          error: "This account is dormant. Please contact support to reactivate it.",
        },
        { status: 403 }
      );
    }

    if (sourceAccount.status === "RESTRICTED") {
      return NextResponse.json(
        {
          success: false,
          error: "This account is restricted. Transfers are not allowed at this time.",
        },
        { status: 403 }
      );
    }

    if (sourceAccount.status === "FROZEN") {
      return NextResponse.json(
        {
          success: false,
          error: "This account is frozen. Please contact support for assistance.",
        },
        { status: 403 }
      );
    }

    // Check sufficient balance
    const balance = Number(sourceAccount.balance);
    if (balance < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance. Available: ${formatCurrency(balance, sourceAccount.currency)}`,
        },
        { status: 400 }
      );
    }

    // Check if a beneficiary ID was passed
    const beneficiaryId = body.beneficiaryId || null;

    // Generate reference
    const reference = generateReference("TRF");

    // Create Transfer + DEBIT Transaction in a Prisma transaction
    const transfer = await prisma.$transaction(async (tx) => {
      // Create the transfer record
      const newTransfer = await tx.transfer.create({
        data: {
          fromAccountId,
          beneficiaryId,
          amount: new Prisma.Decimal(amount),
          currency: sourceAccount.currency,
          status: "PENDING",
          reference,
          description: description || null,
          recipientName,
          recipientBank,
          recipientAcct,
        },
      });

      // Create a DEBIT transaction on the source account (status PENDING)
      const txnReference = generateReference("TXN");
      await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          type: "DEBIT",
          amount: new Prisma.Decimal(amount),
          status: "PENDING",
          reference: txnReference,
          description: `Transfer to ${recipientName} — ${reference}`,
          category: "Transfer",
          balanceAfter: new Prisma.Decimal(balance), // Balance hasn't changed yet (pending)
          metadata: {
            transferId: newTransfer.id,
            transferReference: reference,
          },
        },
      });

      return newTransfer;
    });

    // Send notification email (non-blocking)
    sendTransferAlertEmail(user.email, user.firstName, {
      amount: formatCurrency(amount, sourceAccount.currency),
      recipient: recipientName,
      reference,
      status: "pending",
    }).catch((err) => console.error("Failed to send transfer email:", err));

    return NextResponse.json(
      {
        success: true,
        data: {
          id: transfer.id,
          reference: transfer.reference,
          amount: Number(transfer.amount),
          currency: transfer.currency,
          status: transfer.status,
          recipientName: transfer.recipientName,
          recipientBank: transfer.recipientBank,
          recipientAcct: transfer.recipientAcct,
          description: transfer.description,
          createdAt: transfer.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create transfer error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
