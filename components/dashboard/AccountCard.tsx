import Link from "next/link";
import { Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { cn, formatCurrency, maskAccountNumber } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import type { AccountType, AccountStatus } from "@/app/generated/prisma/client";

interface AccountCardProps {
  id: string;
  type: AccountType;
  accountNumber: string;
  label: string;
  balance: number | string;
  currency: string;
  status: AccountStatus;
}

const typeConfig: Record<
  AccountType,
  { icon: typeof Wallet; label: string; accent: string }
> = {
  CHECKING: {
    icon: Wallet,
    label: "Checking Account",
    accent: "text-gold-500",
  },
  SAVINGS: {
    icon: PiggyBank,
    label: "Savings Account",
    accent: "text-success",
  },
  INVESTMENT: {
    icon: TrendingUp,
    label: "Investment Account",
    accent: "text-blue-400",
  },
};

export default function AccountCard({
  id,
  type,
  accountNumber,
  label,
  balance,
  currency,
  status,
}: AccountCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Link href={`/dashboard/accounts/${id}`}>
      <div className="card-shine group rounded-xl bg-navy-800 border border-border-subtle p-5 transition-all duration-200 hover:border-gold-500/30 hover:shadow-lg hover:shadow-navy-950/50">
        {/* Top row — icon + status */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-navy-700/60 border border-border-subtle",
              config.accent
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Label + type */}
        <p className="text-sm font-medium text-text-primary mb-0.5">
          {label}
        </p>
        <p className="text-xs text-text-muted mb-3">
          {config.label} &middot; {maskAccountNumber(accountNumber)}
        </p>

        {/* Balance */}
        <p className="text-xl font-bold text-text-primary tracking-tight">
          {formatCurrency(balance, currency)}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{currency} Balance</p>
      </div>
    </Link>
  );
}
