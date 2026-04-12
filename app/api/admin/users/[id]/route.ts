import { NextRequest, NextResponse } from "next/server";
import { getSession, getClientIP } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
