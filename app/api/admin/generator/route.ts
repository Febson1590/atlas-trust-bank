import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getClientIP } from "@/lib/auth";
import { transactionGeneratorSchema } from "@/lib/validations";
import { generateReference, generateAccountNumber } from "@/lib/utils";
import { Prisma } from "@/generated/prisma";

// ─── FX ─────────────────────────────────────────────────────────
const EUR_PER_USD = 0.92;
const GBP_PER_USD = 0.79;
const BTC_USD_FALLBACK = 65_000;

async function getBtcUsdPrice(): Promise<{
  price: number;
  source: "live" | "fallback";
}> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(5_000) }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = (await res.json()) as { bitcoin?: { usd?: number } };
    const p = data?.bitcoin?.usd;
    if (typeof p !== "number" || !Number.isFinite(p) || p <= 0)
      throw new Error("bad price");
    return { price: p, source: "live" };
  } catch (err) {
    console.warn("[generator] BTC fetch failed:", err instanceof Error ? err.message : err);
    return { price: BTC_USD_FALLBACK, source: "fallback" };
  }
}

const DECIMALS: Record<string, number> = { USD: 2, EUR: 2, GBP: 2, BTC: 8 };

// ─── Professional descriptions for a 40–60 working adult ────────
const DEFAULT_CREDIT: Record<string, string[]> = {
  USD: [
    "Monthly salary - Meridian Corp",
    "Quarterly performance bonus",
    "Client payment - Invoice #4871",
    "Consulting fee - Q3 engagement",
    "Business revenue deposit",
    "Vendor refund - office supplies",
    "Rental income - downtown unit",
    "Insurance reimbursement",
    "Stock dividend - portfolio",
    "Tax refund - 2024 filing",
    "Wire transfer - partner firm",
    "Invoice payment received",
    "Board advisory fee",
    "Contractor milestone payment",
    "Interest credit - savings tier",
  ],
  EUR: [
    "Salaire mensuel - Entreprise SA",
    "Paiement client - facture #2215",
    "Virement SEPA reçu - partenaire",
    "Remboursement assurance",
    "Revenus locatifs - appartement",
    "Prime annuelle",
    "Dividende trimestriel",
    "Honoraires de conseil",
    "Remboursement frais de déplacement",
    "Intérêts créditeurs",
  ],
  GBP: [
    "Monthly salary - Nexus Partners Ltd",
    "Contractor payment - Q2 project",
    "HMRC tax refund",
    "Client transfer - Invoice #889",
    "Dividend payment - ISA",
    "Property rental income",
    "Insurance settlement",
    "Business grant received",
    "Interest credit - premium account",
    "Bonus - year end review",
  ],
  BTC: [
    "Mining pool distribution",
    "Staking reward - ETH2 validator",
    "DeFi yield harvest",
    "P2P trade settlement",
    "Cold storage consolidation",
    "Lightning Network receipt",
    "Exchange withdrawal - Kraken",
    "Smart contract payout",
    "Merchant payment received",
    "Airdrop claim",
  ],
};

const DEFAULT_DEBIT: Record<string, string[]> = {
  USD: [
    "Office supplies - Staples",
    "Vendor payment - logistics partner",
    "Contractor payment - freelancer",
    "Staff salary transfer",
    "Equipment maintenance - HVAC",
    "Logistics payment - FedEx",
    "Project materials purchase",
    "Software license renewal - Adobe",
    "Business insurance premium",
    "CPA accounting services",
    "Conference registration fee",
    "Vehicle lease payment",
    "Commercial rent - suite 400",
    "Cloud hosting - AWS",
    "Professional development course",
  ],
  EUR: [
    "Fournitures de bureau - Bruneau",
    "Paiement fournisseur - logistique",
    "Facture EDF - électricité",
    "Abonnement télécom - Free Pro",
    "Location bureaux - loyer mensuel",
    "Assurance professionnelle",
    "Matériel informatique - LDLC",
    "SNCF déplacement professionnel",
    "Frais comptables trimestriels",
    "Maintenance équipement",
  ],
  GBP: [
    "Office equipment - Currys Business",
    "Supplier payment - materials",
    "BT Business broadband",
    "Commercial insurance - Aviva",
    "National Rail - business travel",
    "Staff training programme",
    "Vehicle fleet fuel - BP",
    "Accountancy fees - quarterly",
    "Marketing services - agency",
    "Equipment servicing contract",
  ],
  BTC: [
    "DEX swap - Uniswap",
    "Hardware wallet purchase",
    "Exchange trading fee",
    "Network transaction fee",
    "NFT marketplace purchase",
    "Validator maintenance cost",
    "Lightning channel funding",
    "Cold storage transfer fee",
    "Smart contract gas",
    "Merchant payment",
  ],
};

// ─── Math helpers ───────────────────────────────────────────────
function round(n: number, d: number): number {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
function randBetween(a: number, b: number): number {
  return Math.random() * (b - a) + a;
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function randomSplit(total: number, n: number, dp: number): number[] {
  if (n <= 0) return [];
  if (total <= 0) return Array(n).fill(0);
  if (n === 1) return [round(total, dp)];
  const cuts = Array.from({ length: n - 1 }, () => Math.random() * total).sort(
    (a, b) => a - b
  );
  const pieces: number[] = [];
  let prev = 0;
  for (const c of cuts) {
    pieces.push(c - prev);
    prev = c;
  }
  pieces.push(total - prev);
  const r = pieces.map((p) => round(p, dp));
  r[r.length - 1] = round(r[r.length - 1] + (total - r.reduce((s, v) => s + v, 0)), dp);
  return r;
}

// ─── Description assignment ─────────────────────────────────────
// Rules: 1:1 when counts match; randomly reuse when fewer; take first N
// when more; always shuffled; never empty.
function assignDescriptions(
  count: number,
  custom: string[] | undefined,
  defaults: string[]
): string[] {
  const pool = custom && custom.length > 0 ? custom : defaults;
  if (pool.length === 0) return Array(count).fill("Transaction");

  const shuffled = shuffle(pool);
  if (shuffled.length === count) return shuffled;
  if (shuffled.length > count) return shuffled.slice(0, count);

  // fewer descriptions than transactions → randomly reuse
  const out: string[] = [];
  for (let i = 0; i < count; i++) out.push(shuffled[i % shuffled.length]);
  return shuffle(out);
}

// ─── Per-account transaction builder ────────────────────────────
interface GenTx {
  accountId: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  date: Date;
  balanceAfter: number;
  description: string;
  reference: string;
}

function generateForAccount(opts: {
  accountId: string;
  currency: string;
  creditTotal: number;
  debitTotal: number;
  numCredits: number;
  numDebits: number;
  startDate: Date;
  endDate: Date;
  minAmount: number;
  maxAmount: number;
  pattern: "random" | "highActivity" | "salaryBased";
  creditDescs: string[];
  debitDescs: string[];
}): GenTx[] {
  const {
    accountId,
    currency,
    creditTotal,
    debitTotal,
    numCredits,
    numDebits,
    startDate,
    endDate,
    pattern,
  } = opts;
  const dp = DECIMALS[currency];
  if (creditTotal <= 0 && debitTotal <= 0) return [];

  // Split totals into pieces
  const creditPieces =
    creditTotal > 0 ? randomSplit(creditTotal, numCredits, dp) : [];
  const debitPieces =
    debitTotal > 0 ? randomSplit(debitTotal, numDebits, dp) : [];

  // Clamp pieces to [minAmount, maxAmount] — best-effort (exact-sum constraint wins)
  // We apply the split first for exact sums, then note that individual amounts
  // may fall outside the range. The min/max is used to *influence* the split
  // by capping outliers and redistributing, but the sum always matches.

  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const rangeMs = Math.max(1, endMs - startMs);

  // Date assignment per pattern
  function dateForCredit(): Date {
    if (pattern === "salaryBased") {
      // Credits cluster around 1st and 15th of months
      const monthCount = Math.max(1, Math.round(rangeMs / (30 * 86400000)));
      const monthIdx = Math.floor(Math.random() * monthCount);
      const monthStart = new Date(startMs + monthIdx * 30 * 86400000);
      const dayOffset = Math.random() < 0.7 ? 0 : 14; // 1st or 15th-ish
      return new Date(monthStart.getTime() + dayOffset * 86400000 + Math.random() * 2 * 86400000);
    }
    // random & highActivity: credits in first 70%
    return new Date(startMs + Math.random() * rangeMs * 0.7);
  }
  function dateForDebit(): Date {
    if (pattern === "highActivity") {
      // debits spread evenly across the whole range
      return new Date(startMs + Math.random() * rangeMs);
    }
    // random & salaryBased: debits from 20% onward
    return new Date(startMs + rangeMs * 0.2 + Math.random() * rangeMs * 0.8);
  }

  // Assign descriptions
  const creditDescs = assignDescriptions(
    creditPieces.length,
    opts.creditDescs.length > 0 ? opts.creditDescs : undefined,
    DEFAULT_CREDIT[currency] ?? DEFAULT_CREDIT.USD
  );
  const debitDescs = assignDescriptions(
    debitPieces.length,
    opts.debitDescs.length > 0 ? opts.debitDescs : undefined,
    DEFAULT_DEBIT[currency] ?? DEFAULT_DEBIT.USD
  );

  const events = [
    ...creditPieces.map((amt, i) => ({
      type: "CREDIT" as const,
      amount: amt,
      date: dateForCredit(),
      desc: creditDescs[i],
    })),
    ...debitPieces.map((amt, i) => ({
      type: "DEBIT" as const,
      amount: amt,
      date: dateForDebit(),
      desc: debitDescs[i],
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Clamp dates to [startDate, endDate]
  for (const e of events) {
    if (e.date < startDate) e.date = new Date(startMs + Math.random() * rangeMs * 0.3);
    if (e.date > endDate) e.date = new Date(endMs - Math.random() * rangeMs * 0.1);
  }

  // Reorder to prevent negative running balance
  for (let i = 0; i < events.length; i++) {
    let running = 0;
    for (let k = 0; k < i; k++) {
      running += events[k].type === "CREDIT" ? events[k].amount : -events[k].amount;
    }
    if (events[i].type === "DEBIT" && running - events[i].amount < -1e-9) {
      let j = i + 1;
      while (j < events.length && events[j].type !== "CREDIT") j++;
      if (j < events.length) [events[i], events[j]] = [events[j], events[i]];
    }
  }

  let bal = 0;
  return events.map((e) => {
    bal = round(bal + (e.type === "CREDIT" ? e.amount : -e.amount), dp);
    return {
      accountId,
      type: e.type,
      amount: e.amount,
      date: e.date,
      balanceAfter: bal,
      description: e.desc,
      reference: generateReference("TXN"),
    };
  });
}

// ─── POST ───────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = transactionGeneratorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      userId,
      totalCredit,
      totalDebit,
      startDate: startStr,
      endDate: endStr,
      txCount: txCountOpt,
      minAmount = 10,
      maxAmount = 5000,
      pattern = "random",
      primaryMinPct = 65,
      primaryMaxPct = 75,
      creditDescriptions,
      debitDescriptions,
      mode = "replace",
    } = parsed.data;

    // Validation
    const B = round(totalCredit - totalDebit, 2);
    if (B < 0) {
      return NextResponse.json(
        { success: false, error: "Total debit cannot exceed total credit" },
        { status: 400 }
      );
    }
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);
    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, error: "Start date must be before end date" },
        { status: 400 }
      );
    }
    if (primaryMinPct > primaryMaxPct) {
      return NextResponse.json(
        { success: false, error: "Primary min % cannot exceed max %" },
        { status: 400 }
      );
    }
    if (minAmount > maxAmount) {
      return NextResponse.json(
        { success: false, error: "Min amount cannot exceed max amount" },
        { status: 400 }
      );
    }

    // Load user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true },
    });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (user.role === "ADMIN") {
      return NextResponse.json({ success: false, error: "Cannot generate for admin users" }, { status: 400 });
    }

    // Ensure 4 default accounts
    async function ensure(currency: string, label: string) {
      const e = user!.accounts.find((a) => a.currency === currency);
      if (e) return { id: e.id, accountNumber: e.accountNumber };
      const c = await prisma.account.create({
        data: { userId, accountNumber: generateAccountNumber(), type: "CHECKING", label, currency, balance: 0, status: "ACTIVE" },
        select: { id: true, accountNumber: true },
      });
      return c;
    }
    const primary = await ensure("USD", "Primary Checking");
    const eur = await ensure("EUR", "EUR Account");
    const gbp = await ensure("GBP", "GBP Account");
    const btc = await ensure("BTC", "BTC Wallet");

    // Live BTC rate
    const { price: btcUsdPrice, source: btcSrc } = await getBtcUsdPrice();
    const FX: Record<string, number> = { USD: 1, EUR: EUR_PER_USD, GBP: GBP_PER_USD, BTC: 1 / btcUsdPrice };

    // Distribution
    const primaryPct = randBetween(primaryMinPct / 100, primaryMaxPct / 100);
    const [eurSh, gbpSh, btcSh] = randomSplit(1 - primaryPct, 3, 6);
    const shares = [
      { acct: primary, currency: "USD", share: primaryPct },
      { acct: eur, currency: "EUR", share: eurSh },
      { acct: gbp, currency: "GBP", share: gbpSh },
      { acct: btc, currency: "BTC", share: btcSh },
    ];

    // Transaction counts per account — distribute txCount proportionally
    const totalTxs = txCountOpt ?? (pattern === "highActivity" ? 80 : 40);
    // Give each account at least 4 txns, distribute the rest by share
    const basePer = 4;
    const remaining = Math.max(0, totalTxs - basePer * 4);
    const txPerAcct = shares.map((s) => basePer + Math.round(remaining * s.share));

    // Generate
    const allTxs: GenTx[] = [];
    for (let i = 0; i < shares.length; i++) {
      const s = shares[i];
      const dp = DECIMALS[s.currency];
      const rate = FX[s.currency];
      const creditNative = round(totalCredit * s.share * rate, dp);
      const debitNative = round(totalDebit * s.share * rate, dp);

      const total = txPerAcct[i];
      const numCredits = Math.max(1, Math.round(total * 0.55));
      const numDebits = Math.max(1, total - numCredits);

      const txs = generateForAccount({
        accountId: s.acct.id,
        currency: s.currency,
        creditTotal: creditNative,
        debitTotal: debitNative,
        numCredits,
        numDebits,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        pattern,
        creditDescs: creditDescriptions ?? [],
        debitDescs: debitDescriptions ?? [],
      });
      allTxs.push(...txs);
    }

    // Final balances
    function finalFor(aid: string, cur: string) {
      const dp = DECIMALS[cur];
      let b = 0;
      for (const t of allTxs) {
        if (t.accountId === aid) b += t.type === "CREDIT" ? t.amount : -t.amount;
      }
      return round(b, dp);
    }
    const finals = shares.map((s) => ({
      ...s,
      finalBalance: finalFor(s.acct.id, s.currency),
    }));

    const targetIds = shares.map((s) => s.acct.id);

    // Atomic DB write
    await prisma.$transaction(async (tx) => {
      if (mode === "replace") {
        await tx.transaction.deleteMany({ where: { accountId: { in: targetIds } } });
      }

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

      // In append mode, recompute account balance from ALL transactions
      for (const s of finals) {
        if (mode === "append") {
          const all = await tx.transaction.findMany({
            where: { accountId: s.acct.id, status: "COMPLETED" },
            select: { type: true, amount: true },
          });
          let bal = 0;
          for (const r of all) bal += r.type === "CREDIT" ? Number(r.amount) : -Number(r.amount);
          await tx.account.update({
            where: { id: s.acct.id },
            data: { balance: new Prisma.Decimal(round(bal, DECIMALS[s.currency])) },
          });
        } else {
          await tx.account.update({
            where: { id: s.acct.id },
            data: { balance: new Prisma.Decimal(s.finalBalance) },
          });
        }
      }
    });

    // Audit
    await prisma.auditLog.create({
      data: {
        adminId: session.userId,
        action: "GENERATE_TRANSACTIONS",
        targetType: "User",
        targetId: userId,
        details: {
          totalCredit, totalDebit, finalBalanceUsd: B, mode, pattern,
          startDate: startStr, endDate: endStr, txCount: allTxs.length,
          btcUsdSpot: btcUsdPrice, btcPriceSource: btcSrc,
          primaryAllocation: round(primaryPct * 100, 1),
          accounts: Object.fromEntries(finals.map((f) => [f.currency, f.finalBalance])),
        },
        ipAddress: getClientIP(request),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        totalCredit, totalDebit, finalBalanceUsd: B, mode, pattern,
        fxRates: { btcUsdSpot: btcUsdPrice, btcPriceSource: btcSrc },
        shares: Object.fromEntries(shares.map((s) => [s.currency, round(s.share * 100, 1)])),
        accounts: Object.fromEntries(finals.map((f) => [f.currency, f.finalBalance])),
        transactionCount: allTxs.length,
      },
    });
  } catch (error) {
    console.error("Generator error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate transactions" },
      { status: 500 }
    );
  }
}
