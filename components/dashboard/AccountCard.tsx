import Link from "next/link";
import { Wallet, PiggyBank, TrendingUp } from "lucide-react";
import { cn, formatCurrency, maskAccountNumber } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import type { AccountType, AccountStatus } from "@/generated/prisma";

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
    label: "Main Account",
    accent: "text-gold-500",
  },
  SAVINGS: {
    icon: PiggyBank,
    label: "Savings",
    accent: "text-success",
  },
  INVESTMENT: {
    icon: TrendingUp,
    label: "Investment",
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
      <div className="card-shine group rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-5 transition-all duration-200 hover:border-gold-500/30 hover:shadow-lg hover:shadow-navy-950/50">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-navy-700/60 border border-border-subtle",
              config.accent
            )}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-text-primary mb-0.5">
          {label || config.label}
        </p>
        <p className="text-xs text-text-muted mb-3">
          Ending in {maskAccountNumber(accountNumber)}
        </p>

        {/* Balance */}
        <p className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
          {formatCurrency(balance, currency)}
        </p>
      </div>
    </Link>
  );
}
