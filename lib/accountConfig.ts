import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Euro,
  PoundSterling,
  Bitcoin,
} from "lucide-react";
import type { ComponentType } from "react";
import type { AccountType } from "@/generated/prisma";

/**
 * Visual config for an account row (icon + color + fallback label).
 *
 * A new user registers with 4 default accounts — Primary Checking (USD),
 * EUR Account (EUR), GBP Account (GBP), and BTC Wallet (BTC). Savings
 * was removed from the default issuance set and from the admin create
 * form, but the `SAVINGS` enum value is kept in the schema (and in the
 * switch below as a defensive fallback) so any legacy rows still render
 * sensibly if they slip through.
 *
 * The Prisma `AccountType` enum only has `CHECKING | SAVINGS | INVESTMENT`,
 * so the multi-currency accounts are distinguished at the UI layer by
 * currency, not by a new type.
 *
 * Call sites: `components/dashboard/AccountCard.tsx`,
 * `app/dashboard/accounts/page.tsx`, `app/dashboard/accounts/[id]/page.tsx`.
 */
export interface AccountDisplay {
  icon: ComponentType<{ className?: string }>;
  label: string;
  accent: string;
  bgAccent: string;
}

export function getAccountDisplay(
  type: AccountType,
  currency: string
): AccountDisplay {
  // Currency takes precedence over type for non-USD accounts — a "CHECKING"
  // row with currency EUR should render as the EUR Account, not as the
  // generic dollar checking icon.
  if (currency === "BTC") {
    return {
      icon: Bitcoin,
      label: "BTC Wallet",
      accent: "text-orange-400",
      bgAccent: "bg-orange-400/10 border-orange-400/20",
    };
  }
  if (currency === "EUR") {
    return {
      icon: Euro,
      label: "EUR Account",
      accent: "text-blue-400",
      bgAccent: "bg-blue-400/10 border-blue-400/20",
    };
  }
  if (currency === "GBP") {
    return {
      icon: PoundSterling,
      label: "GBP Account",
      accent: "text-purple-400",
      bgAccent: "bg-purple-400/10 border-purple-400/20",
    };
  }

  // USD / default: pick by account type.
  switch (type) {
    case "SAVINGS":
      return {
        icon: PiggyBank,
        label: "Savings",
        accent: "text-success",
        bgAccent: "bg-success/10 border-success/20",
      };
    case "INVESTMENT":
      return {
        icon: TrendingUp,
        label: "Investment",
        accent: "text-blue-400",
        bgAccent: "bg-blue-400/10 border-blue-400/20",
      };
    case "CHECKING":
    default:
      return {
        icon: Wallet,
        label: "Main Account",
        accent: "text-gold-500",
        bgAccent: "bg-gold-500/10 border-gold-500/20",
      };
  }
}
