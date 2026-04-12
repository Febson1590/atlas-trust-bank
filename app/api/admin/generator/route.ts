import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { transactionGeneratorSchema } from "@/lib/validations";
import { generateReference } from "@/lib/utils";
import { Prisma } from "@/app/generated/prisma";

// ─── Realistic descriptions based on transaction type ───────────
const CREDIT_DESCRIPTIONS = [
  "Wire transfer from partner account",
  "Salary deposit — Direct payment",
  "Interest payment — Monthly accrual",
  "Refund — Online merchant",
  "Investment dividend payout",
  "Cashback reward credit",
  "Insurance claim settlement",
  "Freelance payment received",
  "Rental income deposit",
  "Tax refund — Federal",
  "Wire transfer — International",
  "Bonus payment — Quarterly",
  "Peer-to-peer transfer received",
  "Stock sale proceeds",
  "Consulting fee payment",
];

const DEBIT_DESCRIPTIONS = [
  "Online purchase at Amazon",
  "Utility payment — Electric bill",
  "Subscription fee — Netflix",
  "Grocery purchase — Whole Foods",
  "Restaurant payment — Dining",
  "Gas station — Fuel purchase",
  "Insurance premium — Monthly",
  "Mortgage payment — Monthly",
  "Phone bill — AT&T",
  "Internet service — Comcast",
  "Gym membership — Monthly",
  "Cloud services — AWS",
  "Software license — Annual",
  "Travel booking — Airlines",
  "Healthcare payment — Copay",
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime);
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── POST — Generate realistic transaction history ──────────────
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
    const result = transactionGeneratorSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { accountId, count, startDate, endDate, minAmount, maxAmount, types } = result.data;

    if (minAmount > maxAmount) {
      return NextResponse.json(
        { success: false, error: "minAmount cannot be greater than maxAmount" },
        { status: 400 }
      );
    }

    // Fetch account
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Generate transactions sorted by date (newest first for backwards balance calc)
    const transactions: {
      type: "CREDIT" | "DEBIT";
      amount: number;
      date: Date;
      description: string;
      reference: string;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const type = randomElement(types) as "CREDIT" | "DEBIT";
      const amount = Math.round(randomBetween(minAmount, maxAmount) * 100) / 100;
      const date = randomDate(start, end);
      const description = type === "CREDIT"
        ? randomElement(CREDIT_DESCRIPTIONS)
        : randomElement(DEBIT_DESCRIPTIONS);
      const reference = generateReference("TXN");

      transactions.push({ type, amount, date, description, reference });
    }

    // Sort by date descending (newest first)
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Calculate running balance working backwards from current balance
    let currentBalance = Number(account.balance);
    const withBalance = transactions.map((tx) => {
      const balanceAfter = currentBalance;
      // Work backwards: if it was a CREDIT, subtract it; if DEBIT, add it back
      if (tx.type === "CREDIT") {
        currentBalance -= tx.amount;
      } else {
        currentBalance += tx.amount;
      }
      return { ...tx, balanceAfter };
    });

    // Create all transactions in Prisma
    const createdCount = await prisma.$transaction(async (txClient) => {
      let created = 0;
      for (const tx of withBalance) {
        await txClient.transaction.create({
          data: {
            accountId,
            type: tx.type,
            amount: new Prisma.Decimal(tx.amount),
            status: "COMPLETED",
            reference: tx.reference,
            description: tx.description,
            category: "Generated",
            balanceAfter: new Prisma.Decimal(tx.balanceAfter),
            createdAt: tx.date,
            metadata: {
              generated: true,
              adminId: session.userId,
            },
          },
        });
        created++;
      }
      return created;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "GENERATE_TRANSACTIONS",
        targetType: "Account",
        targetId: accountId,
        details: {
          count: createdCount,
          accountNumber: account.accountNumber,
          dateRange: { startDate, endDate },
          amountRange: { minAmount, maxAmount },
          types,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        count: createdCount,
        accountNumber: account.accountNumber,
        accountLabel: account.label,
        userName: `${account.user.firstName} ${account.user.lastName}`,
      },
    });
  } catch (error) {
    console.error("Transaction generator error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate transactions" },
      { status: 500 }
    );
  }
}
