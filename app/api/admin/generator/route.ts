import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { transactionGeneratorSchema } from "@/lib/validations";
import { generateReference } from "@/lib/utils";
import { Prisma } from "@/generated/prisma";

// ─── Realistic descriptions ─────────────────────────────────────
const CREDIT_DESCRIPTIONS = [
  "Salary deposit",
  "Wire transfer received",
  "Interest payment",
  "Refund — online purchase",
  "Dividend payout",
  "Freelance payment",
  "Rental income",
  "Insurance settlement",
  "Cashback reward",
  "Peer transfer received",
  "Consulting fee",
  "Tax refund",
  "Bonus payment",
  "Client payment",
  "Stock sale proceeds",
];

const DEBIT_DESCRIPTIONS = [
  "Grocery purchase",
  "Electric bill payment",
  "Netflix subscription",
  "Restaurant payment",
  "Gas station",
  "Insurance premium",
  "Mortgage payment",
  "Phone bill",
  "Internet service",
  "Gym membership",
  "Cloud services",
  "Travel booking",
  "Healthcare copay",
  "Online shopping",
  "Software license",
];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── POST — Generate balance-aware transaction history ──────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = transactionGeneratorSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { accountId, count, startDate, endDate, minAmount, maxAmount, types, targetBalance } = result.data;

    if (minAmount > maxAmount) {
      return NextResponse.json({ success: false, error: "Min amount cannot exceed max amount" }, { status: 400 });
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });

    if (!account) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json({ success: false, error: "Start date must be before end date" }, { status: 400 });
    }

    const allowCredit = types.includes("CREDIT");
    const allowDebit = types.includes("DEBIT");
    let runningBalance = Number(account.balance);

    // If target balance is set, calculate needed net change
    const hasTarget = targetBalance !== undefined && targetBalance !== null;
    const netNeeded = hasTarget ? (targetBalance as number) - runningBalance : 0;

    // Generate transactions in chronological order
    const dates: Date[] = [];
    for (let i = 0; i < count; i++) {
      dates.push(randomDate(start, end));
    }
    dates.sort((a, b) => a.getTime() - b.getTime());

    // Track used descriptions to avoid repeats
    const usedCredits = new Set<string>();
    const usedDebits = new Set<string>();

    function getDescription(type: "CREDIT" | "DEBIT"): string {
      const pool = type === "CREDIT" ? CREDIT_DESCRIPTIONS : DEBIT_DESCRIPTIONS;
      const used = type === "CREDIT" ? usedCredits : usedDebits;
      // Reset if all used
      if (used.size >= pool.length) used.clear();
      let desc = randomElement(pool);
      let attempts = 0;
      while (used.has(desc) && attempts < 20) {
        desc = randomElement(pool);
        attempts++;
      }
      used.add(desc);
      return desc;
    }

    interface TxData {
      type: "CREDIT" | "DEBIT";
      amount: number;
      date: Date;
      description: string;
      reference: string;
      balanceAfter: number;
    }

    const transactions: TxData[] = [];

    for (let i = 0; i < count; i++) {
      let type: "CREDIT" | "DEBIT";
      let amount: number;

      if (hasTarget && i === count - 1) {
        // Last transaction — adjust to hit target balance
        const remaining = (targetBalance as number) - runningBalance;
        if (remaining > 0 && allowCredit) {
          type = "CREDIT";
          amount = Math.round(Math.abs(remaining) * 100) / 100;
        } else if (remaining < 0 && allowDebit) {
          type = "DEBIT";
          amount = Math.round(Math.abs(remaining) * 100) / 100;
        } else {
          // Can't adjust — skip or make a small credit
          type = "CREDIT";
          amount = randomBetween(minAmount, Math.min(maxAmount, 100));
        }
      } else {
        // Determine type based on balance awareness
        if (allowCredit && allowDebit) {
          // Bias toward target if set
          if (hasTarget) {
            const remaining = (targetBalance as number) - runningBalance;
            const txsLeft = count - i;
            type = remaining > 0
              ? (Math.random() < 0.65 ? "CREDIT" : "DEBIT")
              : (Math.random() < 0.65 ? "DEBIT" : "CREDIT");
          } else {
            type = Math.random() < 0.5 ? "CREDIT" : "DEBIT";
          }
        } else {
          type = allowCredit ? "CREDIT" : "DEBIT";
        }

        amount = randomBetween(minAmount, maxAmount);

        // Guard: don't let debit exceed balance
        if (type === "DEBIT") {
          const maxDebit = Math.max(runningBalance * 0.4, minAmount);
          if (amount > runningBalance) {
            // Either reduce amount or flip to credit
            if (runningBalance > minAmount) {
              amount = randomBetween(minAmount, Math.min(maxDebit, maxAmount));
            } else if (allowCredit) {
              type = "CREDIT";
            } else {
              amount = Math.min(amount, Math.max(runningBalance - 1, 0.01));
            }
          }
        }
      }

      // Apply to running balance
      if (type === "CREDIT") {
        runningBalance += amount;
      } else {
        runningBalance -= amount;
        // Safety: prevent negative
        if (runningBalance < 0) {
          amount = amount + runningBalance; // reduce to exactly 0
          runningBalance = 0;
        }
      }

      runningBalance = Math.round(runningBalance * 100) / 100;

      transactions.push({
        type,
        amount: Math.round(amount * 100) / 100,
        date: dates[i],
        description: getDescription(type),
        reference: generateReference("TXN"),
        balanceAfter: runningBalance,
      });
    }

    const finalBalance = runningBalance;

    // Create transactions and update account balance in one atomic operation
    const createdCount = await prisma.$transaction(async (tx) => {
      let created = 0;
      for (const txData of transactions) {
        await tx.transaction.create({
          data: {
            accountId,
            type: txData.type,
            amount: new Prisma.Decimal(txData.amount),
            status: "COMPLETED",
            reference: txData.reference,
            description: txData.description,
            category: "Generated",
            balanceAfter: new Prisma.Decimal(txData.balanceAfter),
            createdAt: txData.date,
            metadata: { generated: true, adminId: session.userId },
          },
        });
        created++;
      }

      // Update account balance to match final transaction
      await tx.account.update({
        where: { id: accountId },
        data: { balance: new Prisma.Decimal(finalBalance) },
      });

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
          previousBalance: Number(account.balance),
          newBalance: finalBalance,
          dateRange: { startDate, endDate },
          amountRange: { minAmount, maxAmount },
          types,
          targetBalance: targetBalance ?? null,
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
        previousBalance: Number(account.balance),
        newBalance: finalBalance,
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
