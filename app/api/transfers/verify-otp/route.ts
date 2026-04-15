import { NextResponse } from "next/server";
import { getSession, verifyOTP } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transferSchema } from "@/lib/validations";
import { generateReference, formatCurrency } from "@/lib/utils";
import { sendTransferAlertEmail } from "@/lib/email";
import { Prisma } from "@/generated/prisma";

// ─── POST — Verify OTP then create transfer ──────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, transferData } = body;

    // Validate OTP code
    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json(
        { success: false, error: "Please enter the full 6-digit code" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, firstName: true, kycStatus: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify the OTP
    const otpResult = await verifyOTP(user.email, "transfer", code);

    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, error: otpResult.error || "The code you entered is incorrect" },
        { status: 400 }
      );
    }

    // OTP is valid — now create the transfer

    // Validate transfer data
    if (!transferData) {
      return NextResponse.json(
        { success: false, error: "Transfer details are missing" },
        { status: 400 }
      );
    }

    const parsed = transferSchema.safeParse(transferData);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid transfer details" },
        { status: 400 }
      );
    }

    const { fromAccountId, recipientName, recipientBank, recipientAcct, amount, description } =
      parsed.data;

    // Check KYC
    if (user.kycStatus !== "VERIFIED") {
      return NextResponse.json(
        { success: false, error: "Please complete identity verification first." },
        { status: 403 }
      );
    }

    // Check source account
    const sourceAccount = await prisma.account.findFirst({
      where: { id: fromAccountId, userId: session.userId },
    });

    if (!sourceAccount) {
      return NextResponse.json(
        { success: false, error: "Source account not found" },
        { status: 404 }
      );
    }

    if (sourceAccount.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "This account is not active. Please contact support." },
        { status: 403 }
      );
    }

    // Check balance
    const balance = Number(sourceAccount.balance);
    if (balance < amount) {
      return NextResponse.json(
        {
          success: false,
          error: `Not enough funds. Available: ${formatCurrency(balance, sourceAccount.currency)}`,
        },
        { status: 400 }
      );
    }

    const beneficiaryId = transferData.beneficiaryId || null;
    const reference = generateReference("TRF");

    // Create transfer + pending debit transaction
    const transfer = await prisma.$transaction(async (tx) => {
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

      const txnReference = generateReference("TXN");
      // Projected post-debit balance (see matching comment in
      // /api/transfers/submit — same bug, both entry points).
      const projectedBalance = balance - amount;
      await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          type: "DEBIT",
          amount: new Prisma.Decimal(amount),
          status: "PENDING",
          reference: txnReference,
          description: `Transfer to ${recipientName} — ${reference}`,
          category: "Transfer",
          balanceAfter: new Prisma.Decimal(projectedBalance),
          metadata: {
            transferId: newTransfer.id,
            transferReference: reference,
          },
        },
      });

      return newTransfer;
    });

    // Send pending transfer email (non-blocking)
    sendTransferAlertEmail(user.email, user.firstName, {
      amount: formatCurrency(amount, sourceAccount.currency),
      recipient: recipientName,
      reference,
      status: "pending",
    }).catch((err) => console.error("Failed to send transfer email:", err));

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Transfer verify-otp error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
