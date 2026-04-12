import { NextRequest, NextResponse } from "next/server";
import { getSession, getClientIP } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET: Fetch all users with pagination, search, filters ──
export async function GET(request: NextRequest) {
  try {
    // Validate admin session
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
    const search = searchParams.get("search")?.trim() ?? "";
    const roleFilter = searchParams.get("role")?.toUpperCase();
    const statusFilter = searchParams.get("status")?.toUpperCase();

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (roleFilter && ["USER", "ADMIN"].includes(roleFilter)) {
      where.role = roleFilter;
    }

    if (statusFilter && ["ACTIVE", "SUSPENDED", "FROZEN"].includes(statusFilter)) {
      where.status = statusFilter;
    }

    // Fetch users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          kycStatus: true,
          createdAt: true,
          lastLoginAt: true,
          accounts: {
            select: {
              id: true,
              balance: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform to include account count and total balance
    const transformedUsers = users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      kycStatus: user.kycStatus,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      accountsCount: user.accounts.length,
      totalBalance: user.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0),
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── PUT: Update user status ────────────────────────────────
export async function PUT(request: NextRequest) {
  try {
    // Validate admin session
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

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json(
        { error: "userId and status are required" },
        { status: 400 }
      );
    }

    if (!["ACTIVE", "SUSPENDED", "FROZEN"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be ACTIVE, SUSPENDED, or FROZEN" },
        { status: 400 }
      );
    }

    // Prevent admin from modifying their own status
    if (userId === session.userId) {
      return NextResponse.json(
        { error: "Cannot modify your own status" },
        { status: 400 }
      );
    }

    // Get current user state for audit log
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "UPDATE_USER_STATUS",
        targetType: "USER",
        targetId: userId,
        details: {
          previousStatus: targetUser.status,
          newStatus: status,
          userEmail: targetUser.email,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
