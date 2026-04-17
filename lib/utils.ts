import crypto from "crypto";

// ─── Currency Formatting ─────────────────────────────────

export function formatCurrency(
  amount: number | string,
  currency: string = "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  // BTC is not an ISO 4217 code — Intl.NumberFormat throws on it. Format
  // manually with the Bitcoin symbol and a few more decimals of precision.
  if (currency === "BTC") {
    const formatted = num.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    });
    return `\u20BF ${formatted}`;
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    // Unknown / unsupported currency — fall back to "CODE 0.00" form.
    return `${currency} ${num.toFixed(2)}`;
  }
}

// ─── Reference / ID Generation ───────────────────────────

export function generateReference(prefix: string = "TXN"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateAccountNumber(): string {
  // 10-digit account number starting with 4
  const rest = crypto.randomInt(100000000, 999999999).toString();
  return `4${rest}`;
}

// ─── Date Formatting ────────────────────────────────────

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(d);
}

// ─── String Helpers ─────────────────────────────────────

export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length < 4) return accountNumber;
  return "****" + accountNumber.slice(-4);
}

export function maskCardNumber(lastFour: string): string {
  return `**** **** **** ${lastFour}`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ─── Validation Helpers ─────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Misc ───────────────────────────────────────────────

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Translate a raw DB account status into what we SHOW the account holder
 * on their own dashboard. Admins still see the truth — this is for
 * customer-facing views only.
 *
 * Why: product decision — when an account is marked DORMANT by an admin,
 * we don't want the user to see a "Dormant" label on their account card.
 * Instead the account looks Active to them, and only when they try to
 * actually move money does the system surface a friendly "inactive for
 * a long time, please contact support" message. This avoids alarming
 * users who might not know what dormant means, and keeps the lock-down
 * decision an admin-side concern.
 *
 * FROZEN / RESTRICTED stay visible because those are usually triggered
 * by explicit security actions (e.g. user reported their card lost) and
 * the user already knows about them.
 */
// Uses a loose generic instead of the Prisma AccountStatus enum so this
// helper can be used both where the enum type is in scope and where we
// just have a plain string (e.g. serialized JSON props). Callers keep
// their original typing — DORMANT → ACTIVE swap happens transparently.
export function userFacingAccountStatus<T extends string>(dbStatus: T): T {
  if (dbStatus === "DORMANT") return "ACTIVE" as T;
  return dbStatus;
}

/**
 * Canonical display order for the 4 default account currencies.
 *
 * Primary Checking (USD) is intentionally first — it's the account
 * users identify with, and putting it last (as a raw `orderBy: createdAt asc`
 * sometimes did, because all 4 default accounts are inserted in a single
 * nested-create and Postgres isn't required to preserve array order) was
 * confusing for customers who expected their main account to lead.
 *
 * Any exotic currency (from a custom admin-created account) sorts after
 * these four, by its own creation time.
 */
const CURRENCY_PRIORITY: Record<string, number> = {
  USD: 0,
  EUR: 1,
  GBP: 2,
  BTC: 3,
};

export function sortAccountsForDisplay<
  T extends { currency: string; createdAt: string | Date }
>(accounts: T[]): T[] {
  return [...accounts].sort((a, b) => {
    const aRank = CURRENCY_PRIORITY[a.currency] ?? 99;
    const bRank = CURRENCY_PRIORITY[b.currency] ?? 99;
    if (aRank !== bRank) return aRank - bRank;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}
