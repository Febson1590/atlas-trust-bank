import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { adminCreditDebitSchema, adminAccountStatusSchema } from "@/lib/validations";
import { generateAccountNumber, generateReference } from "@/lib/utils";
import { Prisma } from "@/app/generated/prisma/client";

// ─── GET — Fetch all accounts with user info ────────────────────
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
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where = search
      ? { accountNumber: { contains: search } }
      : {};

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: { transactions: true, cards: true },
          },
        },
      }),
      prisma.account.count({ where }),
    ]);

    const serialized = accounts.map((a) => ({
      id: a.id,
      userId: a.userId,
      accountNumber: a.accountNumber,
      type: a.type,
      label: a.label,
      balance: Number(a.balance),
      currency: a.currency,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      user: a.user,
      _count: a._count,
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
    console.error("Admin fetch accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

// ─── POST — Create new account for a user ───────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, type, label, currency } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { success: false, error: "userId and type are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const accountNumber = generateAccountNumber();

    const account = await prisma.account.create({
      data: {
        userId,
        accountNumber,
        type: type as "CHECKING" | "SAVINGS" | "INVESTMENT",
        label: label || `${type.charAt(0)}${type.slice(1).toLowerCase()} Account`,
        currency: currency || "USD",
        status: "ACTIVE",
        balance: new Prisma.Decimal(0),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "CREATE_ACCOUNT",
        targetType: "Account",
        targetId: account.id,
        details: {
          accountNumber,
          type,
          userId,
          userName: `${user.firstName} ${user.lastName}`,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: account.id,
          accountNumber: account.accountNumber,
          type: account.type,
          label: account.label,
          balance: Number(account.balance),
          currency: account.currency,
          status: account.status,
          createdAt: account.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create account error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}

// ─── PUT — Update account status or balance (credit/debit) ──────
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

    // Determine if this is a status update or a credit/debit operation
    if (body.status) {
      // ── Status Update ──
      const result = adminAccountStatusSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { accountId, status } = result.data;

      const account = await prisma.account.update({
        where: { id: accountId },
        data: { status: status as "ACTIVE" | "DORMANT" | "RESTRICTED" | "FROZEN" },
      });

      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: "UPDATE_ACCOUNT_STATUS",
          targetType: "Account",
          targetId: accountId,
          details: { newStatus: status, accountNumber: account.accountNumber },
          ipAddress: getClientIP(request),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: account.id,
          status: account.status,
        },
      });
    } else if (body.type === "CREDIT" || body.type === "DEBIT") {
      // ── Credit / Debit ──
      const result = adminCreditDebitSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      const { accountId, type, amount, description, category } = result.data;

      // Use Prisma $transaction for atomic balance update
      const updatedAccount = await prisma.$transaction(async (tx) => {
        const account = await tx.account.findUnique({
          where: { id: accountId },
        });

        if (!account) {
          throw new Error("Account not found");
        }

        const currentBalance = Number(account.balance);
        let newBalance: number;

        if (type === "CREDIT") {
          newBalance = currentBalance + amount;
        } else {
          if (currentBalance < amount) {
            throw new Error("Insufficient balance for debit");
          }
          newBalance = currentBalance - amount;
        }

        // Update balance
        const updated = await tx.account.update({
          where: { id: accountId },
          data: { balance: new Prisma.Decimal(newBalance) },
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            accountId,
            type: type as "CREDIT" | "DEBIT",
            amount: new Prisma.Decimal(amount),
            status: "COMPLETED",
            reference: generateReference("ADM"),
            description,
            category: category || "Admin",
            balanceAfter: new Prisma.Decimal(newBalance),
            metadata: {
              adminAction: true,
              adminId: session.userId,
            },
          },
        });

        return updated;
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          adminId: session.userId,
          action: `ADMIN_${body.type}`,
          targetType: "Account",
          targetId: accountId,
          details: {
            type,
            amount,
            description,
            newBalance: Number(updatedAccount.balance),
            accountNumber: updatedAccount.accountNumber,
          },
          ipAddress: getClientIP(request),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updatedAccount.id,
          balance: Number(updatedAccount.balance),
          accountNumber: updatedAccount.accountNumber,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid operation. Provide 'status' or 'type' (CREDIT/DEBIT)." },
        { status: 400 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update account";
    console.error("Admin update account error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
