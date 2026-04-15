import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─── GET — Fetch all accounts for the signed-in user ──────────────
//
// Returns every account the user owns regardless of status (ACTIVE,
// DORMANT, RESTRICTED, FROZEN). Callers that want to render only a
// subset should filter client-side.
//
// Response:
//   { success: true, data: { accounts: [...], totalBalance: number, count: number } }
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accounts = await prisma.account.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
    });

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
      updatedAt: a.updatedAt.toISOString(),
    }));

    // Compute total across ALL accounts. Frontend should not have to
    // recompute this for the common "how much money do I have" question.
    const totalBalance = serialized.reduce(
      (sum, a) => sum + a.balance,
      0
    );

    return NextResponse.json({
      success: true,
      data: {
        accounts: serialized,
        totalBalance,
        count: serialized.length,
      },
    });
  } catch (error) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}
