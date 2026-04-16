import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { transactionGeneratorSchema } from "@/lib/validations";
import { generateReference, generateAccountNumber } from "@/lib/utils";
import { Prisma } from "@/generated/prisma";

// ─── FX Rates ───────────────────────────────────────────────────
// EUR and GBP stay as hardcoded demo rates (not worth another API hop
// for fiat). BTC/USD is fetched live from CoinGecko at generation time
// so the BTC Wallet balance reflects the real market price, with a
// reasonable fallback if the network hop fails.
const EUR_PER_USD = 0.92;
const GBP_PER_USD = 0.79;
const BTC_USD_FALLBACK = 65_000;

async function getBtcUsdPrice(): Promise<{ price: number; source: "live" | "fallback" }> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      {
        headers: { Accept: "application/json" },
        // Next 16 server fetches default to caching — force no-store so
        // every generation grabs a fresh spot price.
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      }
    );
    if (!res.ok) throw new Error(`CoinGecko status ${res.status}`);
    const data = (await res.json()) as { bitcoin?: { usd?: number } };
    const price = data?.bitcoin?.usd;
    if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
      throw new Error("invalid price in response");
    }
    return { price, source: "live" };
  } catch (err) {
    console.warn(
      "[generator] BTC rate fetch failed, using fallback:",
      err instanceof Error ? err.message : String(err)
    );
    return { price: BTC_USD_FALLBACK, source: "fallback" };
  }
}

// Native-currency decimal precision.
const DECIMALS: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  BTC: 8,
};

// ─── Realistic transaction descriptions by currency ─────────────
const CREDIT_DESCRIPTIONS: Record<string, string[]> = {
  USD: [
    "Salary deposit - ACME Corp",
    "Freelance payment - client A",
    "Refund - Amazon",
    "Tax refund - IRS",
    "Stock dividend",
    "Interest credit",
    "Consulting fee",
    "Bonus payment",
    "Client payment - invoice #3321",
    "Cashback reward",
    "Wire transfer received",
    "Stripe payout",
  ],
  EUR: [
    "Salaire - Entreprise SARL",
    "Virement SEPA reçu",
    "Remboursement impôt",
    "Dividende trimestriel",
    "Intérêts crédités",
    "Paiement client",
    "Remboursement Amazon.fr",
    "Prime de fin d'année",
    "Virement familial",
    "Revenus locatifs",
  ],
  GBP: [
    "Salary - HSBC Ltd",
    "Contractor payment",
    "HMRC refund",
    "Dividend payment",
    "Interest credit",
    "Client transfer",
    "Argos refund",
    "Landlord rent received",
    "Amazon UK refund",
    "Bonus - year end",
  ],
  BTC: [
    "Binance withdrawal",
    "Mining pool reward",
    "Lightning Network receipt",
    "NFT sale - OpenSea",
    "P2P trade settlement",
    "Staking reward",
    "DeFi yield",
    "Coinbase deposit",
    "Cold storage transfer in",
    "Merchant settlement",
  ],
};

const DEBIT_DESCRIPTIONS: Record<string, string[]> = {
  USD: [
    "Grocery - Whole Foods",
    "Netflix subscription",
    "Amazon purchase",
    "Uber ride",
    "Electric bill - ConEd",
    "Restaurant - Sushi Bar",
    "Coffee - Starbucks",
    "AT&T phone bill",
    "Gym membership",
    "Gas station",
    "Online shopping",
    "Cloud services - AWS",
  ],
  EUR: [
    "Carrefour courses",
    "SNCF billet train",
    "EDF électricité",
    "Lidl supermarché",
    "Free mobile forfait",
    "Brasserie dîner",
    "Monoprix",
    "Fnac achat",
    "Netflix abonnement",
    "Uber Eats",
  ],
  GBP: [
    "Tesco grocery",
    "TfL Oyster top-up",
    "Sainsbury's",
    "British Gas",
    "Vodafone bill",
    "Pret A Manger",
    "Uber",
    "Amazon UK",
    "Deliveroo",
    "National Rail ticket",
  ],
  BTC: [
    "NFT mint - OpenSea",
    "DEX swap - Uniswap",
    "Hardware wallet order",
    "Coinbase withdrawal fee",
    "Bitrefill gift card",
    "Bitcoin ATM withdrawal",
    "Merchant payment",
    "Network fee",
    "Lightning channel open",
    "Binance trading fee",
  ],
};

// ─── Math helpers ───────────────────────────────────────────────
function round(n: number, decimals: number): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

/**
 * Split `total` into `n` random positive pieces that sum to `total`
 * (up to rounding). Uses the cut-point method: n-1 uniform cuts in
 * [0, total], sorted, then differences.
 */
function randomSplit(total: number, n: number, decimals: number): number[] {
  if (n <= 0) return [];
  if (total <= 0) return new Array(n).fill(0);
  if (n === 1) return [round(total, decimals)];

  const cuts = Array.from({ length: n - 1 }, () => Math.random() * total);
  cuts.sort((a, b) => a - b);

  const pieces: number[] = [];
  let prev = 0;
  for (const c of cuts) {
    pieces.push(c - prev);
    prev = c;
  }
  pieces.push(total - prev);

  // Round and dump rounding drift into the last piece so the sum is
  // exactly `total` after rounding.
  const rounded = pieces.map((p) => round(p, decimals));
  const drift = round(
    total - rounded.reduce((a, b) => a + b, 0),
    decimals
  );
  rounded[rounded.length - 1] = round(
    rounded[rounded.length - 1] + drift,
    decimals
  );
  return rounded;
}

// ─── Per-account transaction generator ─────────────────────────
interface GeneratedTx {
  accountId: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  date: Date;
  balanceAfter: number;
  description: string;
  reference: string;
}

function generateForAccount(options: {
  accountId: string;
  currency: string;
  creditTotal: number;
  debitTotal: number;
  startDate: Date;
  endDate: Date;
}): GeneratedTx[] {
  const { accountId, currency, creditTotal, debitTotal, startDate, endDate } =
    options;
  const dp = DECIMALS[currency];

  if (creditTotal <= 0 && debitTotal <= 0) return [];

  // Count depends roughly on magnitude — smaller totals need fewer
  // transactions to stay readable.
  const numCredits =
    creditTotal > 0 ? Math.min(10, Math.max(3, Math.round(creditTotal / 1500))) : 0;
  const numDebits =
    debitTotal > 0 ? Math.min(8, Math.max(3, Math.round(debitTotal / 700))) : 0;

  const creditPieces = randomSplit(creditTotal, numCredits, dp);
  const debitPieces = randomSplit(debitTotal, numDebits, dp);

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const rangeMs = Math.max(1, endMs - startMs);

  // Credits weighted toward the first 70% of the range; debits toward
  // the last 80%. The overlap is intentional — it produces realistic
  // interleaved activity instead of "all income, then all spending".
  const creditEvents = creditPieces.map((amt) => ({
    type: "CREDIT" as const,
    amount: amt,
    date: new Date(startMs + Math.random() * rangeMs * 0.7),
  }));
  const debitEvents = debitPieces.map((amt) => ({
    type: "DEBIT" as const,
    amount: amt,
    date: new Date(startMs + rangeMs * 0.2 + Math.random() * rangeMs * 0.8),
  }));

  const events = [...creditEvents, ...debitEvents].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  // Prevent running balance from dipping below zero — if a debit would
  // take us negative, swap it with the next credit in the sequence.
  for (let i = 0; i < events.length; i++) {
    let running = 0;
    for (let k = 0; k < i; k++) {
      const e = events[k];
      running += e.type === "CREDIT" ? e.amount : -e.amount;
    }
    const here = events[i];
    if (here.type === "DEBIT" && running - here.amount < -1e-9) {
      let j = i + 1;
      while (j < events.length && events[j].type !== "CREDIT") j++;
      if (j < events.length) {
        [events[i], events[j]] = [events[j], events[i]];
      }
    }
  }

  // Build the transaction records with running balance.
  const creditPool = CREDIT_DESCRIPTIONS[currency] ?? CREDIT_DESCRIPTIONS.USD;
  const debitPool = DEBIT_DESCRIPTIONS[currency] ?? DEBIT_DESCRIPTIONS.USD;
  let creditIdx = 0;
  let debitIdx = 0;
  let running = 0;
  const transactions: GeneratedTx[] = [];
  for (const e of events) {
    running = round(
      running + (e.type === "CREDIT" ? e.amount : -e.amount),
      dp
    );
    const description =
      e.type === "CREDIT"
        ? pick(creditPool, creditIdx++)
        : pick(debitPool, debitIdx++);
    transactions.push({
      accountId,
      type: e.type,
      amount: e.amount,
      date: e.date,
      balanceAfter: running,
      description,
      reference: generateReference("TXN"),
    });
  }

  return transactions;
}

// ─── POST — Generate demo transaction history for a user ────────
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
    const parsed = transactionGeneratorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userId, totalCredit, totalDebit, months = 6 } = parsed.data;

    const B = round(totalCredit - totalDebit, 2);
    if (B < 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Final balance cannot be negative. Total credit must be at least total debit.",
        },
        { status: 400 }
      );
    }

    // Load target user + every account they own.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Cannot generate transactions for an admin user" },
        { status: 400 }
      );
    }

    // Resolve the four target default accounts by currency. If any is
    // missing (e.g. a legacy user registered before the multi-currency
    // default setup), create it on the fly so the generator always has
    // all four to fund.
    async function ensureAccount(
      currency: string,
      label: string
    ): Promise<{ id: string; accountNumber: string }> {
      const existing = user!.accounts.find((a) => a.currency === currency);
      if (existing) return { id: existing.id, accountNumber: existing.accountNumber };
      const created = await prisma.account.create({
        data: {
          userId,
          accountNumber: generateAccountNumber(),
          type: "CHECKING",
          label,
          currency,
          balance: new Prisma.Decimal(0),
          status: "ACTIVE",
        },
        select: { id: true, accountNumber: true },
      });
      return created;
    }

    const primary = await ensureAccount("USD", "Primary Checking");
    const eur = await ensureAccount("EUR", "EUR Account");
    const gbp = await ensureAccount("GBP", "GBP Account");
    const btc = await ensureAccount("BTC", "BTC Wallet");

    // Fetch the live BTC/USD spot price from CoinGecko so the BTC Wallet
    // balance reflects real market conditions at the moment of generation.
    const { price: btcUsdPrice, source: btcPriceSource } = await getBtcUsdPrice();

    // FX table built per-request. USD is the base; EUR/GBP use hardcoded
    // demo rates; BTC uses the live spot price.
    const FX: Record<string, number> = {
      USD: 1,
      EUR: EUR_PER_USD,
      GBP: GBP_PER_USD,
      BTC: 1 / btcUsdPrice,
    };

    // ── Distribution math ─────────────────────────────────────
    // share_primary ∈ [0.65, 0.75]; the remaining (1 - share_primary)
    // is split randomly 3 ways across EUR / GBP / BTC. The same shares
    // are applied to BOTH the credit total and the debit total, which
    // guarantees that for each account i:
    //     credit_i - debit_i = (C - D) * share_i = B * share_i
    // so the per-account final balance matches its share of B exactly.
    const primaryShare = randomBetween(0.65, 0.75);
    const [eurShare, gbpShare, btcShare] = randomSplit(
      1 - primaryShare,
      3,
      6
    );

    function perAccount(share: number, currency: string) {
      const dp = DECIMALS[currency];
      const rate = FX[currency];
      const creditNative = round(totalCredit * share * rate, dp);
      const debitNative = round(totalDebit * share * rate, dp);
      return { creditNative, debitNative };
    }

    const primaryBudget = perAccount(primaryShare, "USD");
    const eurBudget = perAccount(eurShare, "EUR");
    const gbpBudget = perAccount(gbpShare, "GBP");
    const btcBudget = perAccount(btcShare, "BTC");

    // ── Generate transactions ────────────────────────────────
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const allTxs: GeneratedTx[] = [
      ...generateForAccount({
        accountId: primary.id,
        currency: "USD",
        creditTotal: primaryBudget.creditNative,
        debitTotal: primaryBudget.debitNative,
        startDate,
        endDate,
      }),
      ...generateForAccount({
        accountId: eur.id,
        currency: "EUR",
        creditTotal: eurBudget.creditNative,
        debitTotal: eurBudget.debitNative,
        startDate,
        endDate,
      }),
      ...generateForAccount({
        accountId: gbp.id,
        currency: "GBP",
        creditTotal: gbpBudget.creditNative,
        debitTotal: gbpBudget.debitNative,
        startDate,
        endDate,
      }),
      ...generateForAccount({
        accountId: btc.id,
        currency: "BTC",
        creditTotal: btcBudget.creditNative,
        debitTotal: btcBudget.debitNative,
        startDate,
        endDate,
      }),
    ];

    // Compute final balance per account from the generated transactions,
    // so what we save to Account.balance is guaranteed to match the
    // transaction history (the "account overview, total balance, and
    // transaction history must always remain consistent" invariant).
    function finalFor(accountId: string, currency: string): number {
      const dp = DECIMALS[currency];
      let bal = 0;
      for (const t of allTxs) {
        if (t.accountId === accountId) {
          bal += t.type === "CREDIT" ? t.amount : -t.amount;
        }
      }
      return round(bal, dp);
    }

    const primaryFinal = finalFor(primary.id, "USD");
    const eurFinal = finalFor(eur.id, "EUR");
    const gbpFinal = finalFor(gbp.id, "GBP");
    const btcFinal = finalFor(btc.id, "BTC");

    const targetAccountIds = [primary.id, eur.id, gbp.id, btc.id];

    // ── Atomic DB write ──────────────────────────────────────
    // Wipe existing transactions on the four target accounts first,
    // then insert the generated batch, then sync account balances.
    // Everything in one $transaction so a failure rolls the whole
    // thing back.
    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { accountId: { in: targetAccountIds } },
      });

      if (allTxs.length > 0) {
        await tx.transaction.createMany({
          data: allTxs.map((t) => ({
            accountId: t.accountId,
            type: t.type,
            amount: new Prisma.Decimal(t.amount),
            status: "COMPLETED" as const,
            reference: t.reference,
            description: t.description,
            category: "Generated",
            balanceAfter: new Prisma.Decimal(t.balanceAfter),
            createdAt: t.date,
            metadata: { generated: true, adminId: session.userId },
          })),
        });
      }

      await tx.account.update({
        where: { id: primary.id },
        data: { balance: new Prisma.Decimal(primaryFinal) },
      });
      await tx.account.update({
        where: { id: eur.id },
        data: { balance: new Prisma.Decimal(eurFinal) },
      });
      await tx.account.update({
        where: { id: gbp.id },
        data: { balance: new Prisma.Decimal(gbpFinal) },
      });
      await tx.account.update({
        where: { id: btc.id },
        data: { balance: new Prisma.Decimal(btcFinal) },
      });
    });

    // ── Audit log ────────────────────────────────────────────
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "GENERATE_TRANSACTIONS",
        targetType: "User",
        targetId: userId,
        details: {
          totalCredit,
          totalDebit,
          finalBalanceUsd: B,
          months,
          shares: {
            primary: round(primaryShare, 6),
            eur: round(eurShare, 6),
            gbp: round(gbpShare, 6),
            btc: round(btcShare, 6),
          },
          fxRates: {
            eurPerUsd: EUR_PER_USD,
            gbpPerUsd: GBP_PER_USD,
            btcUsdSpot: btcUsdPrice,
            btcPriceSource, // "live" or "fallback"
          },
          finalBalances: {
            primaryUsd: primaryFinal,
            eur: eurFinal,
            gbp: gbpFinal,
            btc: btcFinal,
          },
          transactionCount: allTxs.length,
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        totalCredit,
        totalDebit,
        finalBalanceUsd: B,
        shares: {
          primary: round(primaryShare, 4),
          eur: round(eurShare, 4),
          gbp: round(gbpShare, 4),
          btc: round(btcShare, 4),
        },
        fxRates: {
          btcUsdSpot: btcUsdPrice,
          btcPriceSource,
        },
        accounts: {
          primaryChecking: { currency: "USD", balance: primaryFinal },
          eur: { currency: "EUR", balance: eurFinal },
          gbp: { currency: "GBP", balance: gbpFinal },
          btc: { currency: "BTC", balance: btcFinal },
        },
        transactionCount: allTxs.length,
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
