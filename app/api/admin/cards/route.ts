import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { Prisma } from "@/generated/prisma";
import crypto from "crypto";

// ─── GET — Fetch all cards with account and user info ───────────
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
    const skip = (page - 1) * limit;

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          account: {
            select: {
              id: true,
              accountNumber: true,
              label: true,
              type: true,
              currency: true,
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
        },
      }),
      prisma.card.count(),
    ]);

    const serialized = cards.map((c) => ({
      id: c.id,
      accountId: c.accountId,
      type: c.type,
      lastFour: c.lastFour,
      expiryDate: c.expiryDate,
      cardholderName: c.cardholderName,
      status: c.status,
      dailyLimit: Number(c.dailyLimit),
      createdAt: c.createdAt.toISOString(),
      account: c.account,
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
    console.error("Admin fetch cards error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

// ─── POST — Create card for an account ──────────────────────────
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
    const { accountId, type, cardholderName, dailyLimit } = body;

    if (!accountId || !type || !cardholderName) {
      return NextResponse.json(
        { success: false, error: "accountId, type, and cardholderName are required" },
        { status: 400 }
      );
    }

    // Verify account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // Generate last 4 digits and expiry
    const lastFour = crypto.randomInt(1000, 9999).toString();
    const now = new Date();
    const expiryYear = now.getFullYear() + 4;
    const expiryMonth = String(now.getMonth() + 1).padStart(2, "0");
    const expiryDate = `${expiryMonth}/${expiryYear}`;

    const card = await prisma.card.create({
      data: {
        accountId,
        type: type as "VISA" | "MASTERCARD",
        lastFour,
        expiryDate,
        cardholderName,
        status: "ACTIVE",
        dailyLimit: new Prisma.Decimal(dailyLimit || 5000),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "CREATE_CARD",
        targetType: "Card",
        targetId: card.id,
        details: {
          type,
          lastFour,
          accountId,
          accountNumber: account.accountNumber,
          cardholderName,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: card.id,
          type: card.type,
          lastFour: card.lastFour,
          expiryDate: card.expiryDate,
          cardholderName: card.cardholderName,
          status: card.status,
          dailyLimit: Number(card.dailyLimit),
          createdAt: card.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create card error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create card" },
      { status: 500 }
    );
  }
}

// ─── PUT — Update card (status, dailyLimit) ─────────────────────
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
    const { cardId, status, dailyLimit } = body;

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: "cardId is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.card.findUnique({ where: { id: cardId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (dailyLimit !== undefined) updateData.dailyLimit = new Prisma.Decimal(dailyLimit);

    const card = await prisma.card.update({
      where: { id: cardId },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "UPDATE_CARD",
        targetType: "Card",
        targetId: cardId,
        details: {
          changes: { status, dailyLimit },
          lastFour: existing.lastFour,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: card.id,
        status: card.status,
        dailyLimit: Number(card.dailyLimit),
      },
    });
  } catch (error) {
    console.error("Admin update card error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update card" },
      { status: 500 }
    );
  }
}
