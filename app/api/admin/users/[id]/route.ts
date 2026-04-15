import { NextRequest, NextResponse } from "next/server";
import { getSession, getClientIP } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountStatus } from "@/generated/prisma";

// ─── GET: Fetch single user with all related data ───────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        kycStatus: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        country: true,
        zipCode: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            accountNumber: true,
            type: true,
            label: true,
            balance: true,
            currency: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        kycDocuments: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            fileName: true,
            status: true,
            adminNote: true,
            reviewedAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch recent transactions for this user's accounts
    const accountIds = user.accounts.map((a) => a.id);
    const recentTransactions =
      accountIds.length > 0
        ? await prisma.transaction.findMany({
            where: { accountId: { in: accountIds } },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              type: true,
              amount: true,
              status: true,
              reference: true,
              description: true,
              createdAt: true,
              account: {
                select: { accountNumber: true },
              },
            },
          })
        : [];

    // Fetch cards
    const cards =
      accountIds.length > 0
        ? await prisma.card.findMany({
            where: { accountId: { in: accountIds } },
            select: {
              id: true,
              type: true,
              lastFour: true,
              expiryDate: true,
              cardholderName: true,
              status: true,
              dailyLimit: true,
              createdAt: true,
              account: {
                select: { accountNumber: true },
              },
            },
            orderBy: { createdAt: "desc" },
          })
        : [];

    // Serialize decimals
    const serialized = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      accounts: user.accounts.map((acc) => ({
        ...acc,
        balance: Number(acc.balance),
        createdAt: acc.createdAt.toISOString(),
      })),
      kycDocuments: user.kycDocuments.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        reviewedAt: doc.reviewedAt?.toISOString() ?? null,
      })),
      recentTransactions: recentTransactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
        createdAt: tx.createdAt.toISOString(),
      })),
      cards: cards.map((card) => ({
        ...card,
        dailyLimit: Number(card.dailyLimit),
        createdAt: card.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ user: serialized });
  } catch (error) {
    console.error("Admin user GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── PUT: Update user (status, role, KYC status) ────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, role, kycStatus } = body;

    // Get current user state for audit log
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { status: true, role: true, kycStatus: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from modifying their own role/status
    if (id === session.userId && (status || role)) {
      return NextResponse.json(
        { error: "Cannot modify your own status or role" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const changes: Record<string, { from: string; to: string }> = {};

    if (status && ["ACTIVE", "SUSPENDED", "FROZEN"].includes(status)) {
      updateData.status = status;
      changes.status = { from: targetUser.status, to: status };
    }

    if (role && ["USER", "ADMIN"].includes(role)) {
      updateData.role = role;
      changes.role = { from: targetUser.role, to: role };
    }

    if (
      kycStatus &&
      ["NOT_STARTED", "PENDING", "VERIFIED", "REJECTED"].includes(kycStatus)
    ) {
      updateData.kycStatus = kycStatus;
      changes.kycStatus = { from: targetUser.kycStatus, to: kycStatus };
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        kycStatus: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "UPDATE_USER",
        targetType: "USER",
        targetId: id,
        details: {
          changes,
          userEmail: targetUser.email,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Admin user PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── PATCH: Set all user accounts to DORMANT or ACTIVE ──────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { accountStatus } = body;

    if (!accountStatus || !["DORMANT", "ACTIVE"].includes(accountStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, accounts: { select: { id: true } } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Update all accounts
    await prisma.account.updateMany({
      where: { userId: id },
      data: { status: accountStatus as AccountStatus },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: accountStatus === "DORMANT" ? "SUSPEND_USER" : "ACTIVATE_USER",
        targetType: "USER",
        targetId: id,
        details: {
          accountStatus,
          accountsAffected: user.accounts.length,
          userEmail: user.email,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Permanently delete a user ──────────────────────
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    // Prevent self-deletion
    if (id === session.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true, role: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Don't allow deleting other admins
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 400 });
    }

    // Audit log before deletion
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "DELETE_USER",
        targetType: "USER",
        targetId: id,
        details: { userEmail: user.email },
        ipAddress: getClientIP(request),
      },
    });

    // Delete in correct order to avoid foreign key errors
    const accountIds = (
      await prisma.account.findMany({
        where: { userId: id },
        select: { id: true },
      })
    ).map((a) => a.id);

    await prisma.$transaction(async (tx) => {
      // Delete transfers referencing user's accounts
      if (accountIds.length > 0) {
        await tx.transfer.deleteMany({
          where: {
            OR: [
              { fromAccountId: { in: accountIds } },
              { toAccountId: { in: accountIds } },
            ],
          },
        });
        // Delete transactions
        await tx.transaction.deleteMany({
          where: { accountId: { in: accountIds } },
        });
        // Delete cards
        await tx.card.deleteMany({
          where: { accountId: { in: accountIds } },
        });
      }
      // Delete user (cascades accounts, beneficiaries, kyc, notifications, tickets)
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user DELETE error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
