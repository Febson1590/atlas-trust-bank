import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─── GET -- Fetch user's cards (through their accounts) ──────────
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all user accounts
    const accounts = await prisma.account.findMany({
      where: { userId: session.userId },
      select: { id: true },
    });

    const accountIds = accounts.map((a) => a.id);

    if (accountIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const cards = await prisma.card.findMany({
      where: { accountId: { in: accountIds } },
      orderBy: { createdAt: "desc" },
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            label: true,
            type: true,
            currency: true,
          },
        },
      },
    });

    const serialized = cards.map((card) => ({
      id: card.id,
      accountId: card.accountId,
      account: card.account,
      type: card.type,
      lastFour: card.lastFour,
      expiryDate: card.expiryDate,
      cardholderName: card.cardholderName,
      status: card.status,
      dailyLimit: Number(card.dailyLimit),
      createdAt: card.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: serialized });
  } catch (error) {
    console.error("Fetch cards error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
