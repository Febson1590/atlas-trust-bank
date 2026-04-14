import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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
