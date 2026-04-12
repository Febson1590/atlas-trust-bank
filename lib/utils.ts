import crypto from "crypto";

// ─── Currency Formatting ─────────────────────────────────

export function formatCurrency(
  amount: number | string,
  currency: string = "USD"
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
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
