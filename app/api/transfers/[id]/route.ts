import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─── GET — Fetch single transfer by ID ──────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch transfer with related data
    const transfer = await prisma.transfer.findUnique({
      where: { id },
      include: {
        fromAccount: {
          select: {
            id: true,
            accountNumber: true,
            label: true,
            currency: true,
            userId: true,
          },
        },
        beneficiary: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountNumber: true,
            country: true,
          },
        },
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { success: false, error: "Transfer not found" },
        { status: 404 }
      );
    }

    // Verify ownership — the source account must belong to the user
    if (transfer.fromAccount.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Transfer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: transfer.id,
        fromAccountId: transfer.fromAccountId,
        fromAccount: {
          accountNumber: transfer.fromAccount.accountNumber,
          label: transfer.fromAccount.label,
          currency: transfer.fromAccount.currency,
        },
        beneficiaryId: transfer.beneficiaryId,
        beneficiary: transfer.beneficiary,
        amount: Number(transfer.amount),
        currency: transfer.currency,
        status: transfer.status,
        reference: transfer.reference,
        description: transfer.description,
        recipientName: transfer.recipientName,
        recipientBank: transfer.recipientBank,
        recipientAcct: transfer.recipientAcct,
        adminNote: transfer.adminNote,
        createdAt: transfer.createdAt.toISOString(),
        processedAt: transfer.processedAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Fetch transfer error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transfer details" },
      { status: 500 }
    );
  }
}
