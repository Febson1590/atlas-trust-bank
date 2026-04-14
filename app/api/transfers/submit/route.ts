import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession, verifyOTP } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transferSchema } from "@/lib/validations";
import { generateReference, formatCurrency } from "@/lib/utils";
import { sendTransferAlertEmail } from "@/lib/email";
import { Prisma } from "@/generated/prisma";

// High-risk thresholds
const HIGH_RISK_AMOUNT = 10000;

// ─── POST — Submit transfer with PIN (and OTP if high-risk) ──
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
    const { pin, otpCode, transferData } = body;

    // Get user with PIN
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        kycStatus: true,
        transferPin: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify PIN
    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { success: false, error: "Transfer PIN is required" },
        { status: 400 }
      );
    }

    if (!user.transferPin) {
      return NextResponse.json(
        { success: false, error: "No transfer PIN set. Please set one in Security settings." },
        { status: 400 }
      );
    }

    const pinValid = await bcrypt.compare(pin, user.transferPin);
    if (!pinValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect transfer PIN" },
        { status: 400 }
      );
    }

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

    // Determine if high-risk (needs additional OTP)
    const isHighRisk = amount >= HIGH_RISK_AMOUNT;

    if (isHighRisk && otpCode) {
      // Verify OTP for high-risk transfers
      const otpResult = await verifyOTP(user.email, "transfer", otpCode);
      if (!otpResult.valid) {
        return NextResponse.json(
          { success: false, error: otpResult.error || "Invalid verification code" },
          { status: 400 }
        );
      }
    } else if (isHighRisk && !otpCode) {
      // Signal that OTP is required
      return NextResponse.json(
        {
          success: false,
          error: "OTP_REQUIRED",
          data: { requiresOtp: true, reason: "Transfer amount exceeds security threshold" },
        },
        { status: 400 }
      );
    }

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
        { success: false, error: "This account is not active." },
        { status: 403 }
      );
    }

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

    // Create transfer + pending debit
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
      await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          type: "DEBIT",
          amount: new Prisma.Decimal(amount),
          status: "PENDING",
          reference: txnReference,
          description: `Transfer to ${recipientName} — ${reference}`,
          category: "Transfer",
          balanceAfter: new Prisma.Decimal(balance),
          metadata: {
            transferId: newTransfer.id,
            transferReference: reference,
          },
        },
      });

      return newTransfer;
    });

    // Send pending email
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
    console.error("Transfer submit error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
