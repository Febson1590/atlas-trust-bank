import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  ChevronRight,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, maskAccountNumber, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { AccountType } from "@/generated/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accounts",
};

const typeConfig: Record<
  AccountType,
  { icon: typeof Wallet; label: string; accent: string; bgAccent: string }
> = {
  CHECKING: {
    icon: Wallet,
    label: "Main Account",
    accent: "text-gold-500",
    bgAccent: "bg-gold-500/10 border-gold-500/20",
  },
  SAVINGS: {
    icon: PiggyBank,
    label: "Savings",
    accent: "text-success",
    bgAccent: "bg-success/10 border-success/20",
  },
  INVESTMENT: {
    icon: TrendingUp,
    label: "Investment",
    accent: "text-blue-400",
    bgAccent: "bg-blue-400/10 border-blue-400/20",
  },
};

export default async function AccountsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const accounts = await prisma.account.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Accounts</h2>
        <p className="text-sm text-text-muted mt-1">
          View and manage your accounts.
        </p>
      </div>

      {/* Total Balance + Send Money */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Balance
            </span>
            <p className="text-2xl sm:text-3xl font-bold gold-text mt-1">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {accounts.length}{" "}
              {accounts.length === 1 ? "account" : "accounts"}
            </p>
          </div>
          <Link
            href="/dashboard/transfer"
            className="gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:shadow-md hover:shadow-gold-500/20 flex items-center gap-2 self-start sm:self-center"
          >
            <Send className="h-4 w-4" />
            Send Money
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Link
          href="/dashboard/transfer"
          className="flex items-center gap-1.5 rounded-lg bg-navy-800 border border-border-subtle px-3.5 py-2 text-xs font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
          Send
        </Link>
        <Link
          href="/dashboard/transfer"
          className="flex items-center gap-1.5 rounded-lg bg-navy-800 border border-border-subtle px-3.5 py-2 text-xs font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
        >
          <ArrowDownLeft className="h-3.5 w-3.5 text-text-muted" />
          Deposit
        </Link>
        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1.5 rounded-lg bg-navy-800 border border-border-subtle px-3.5 py-2 text-xs font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
        >
          <FileText className="h-3.5 w-3.5 text-text-muted" />
          Statements
        </Link>
      </div>

      {/* Account Cards */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {accounts.map((account) => {
            const config = typeConfig[account.type];
            const Icon = config.icon;

            return (
              <Link
                key={account.id}
                href={`/dashboard/accounts/${account.id}`}
                className="group block"
              >
                <div className="card-shine rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-5 transition-all duration-200 hover:border-gold-500/30 hover:shadow-lg hover:shadow-navy-950/50">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg border",
                          config.bgAccent
                        )}
                      >
                        <Icon className={cn("h-5 w-5", config.accent)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {account.label || config.label}
                        </p>
                        <p className="text-xs text-text-muted">
                          {account.currency} · Ending in {maskAccountNumber(account.accountNumber)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={account.status} />
                  </div>

                  {/* Balance + View Details */}
                  <div className="flex items-end justify-between">
                    <p className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                      {formatCurrency(Number(account.balance), account.currency)}
                    </p>
                    <span className="flex items-center gap-1 text-xs font-medium text-text-muted group-hover:text-gold-500 transition-colors">
                      Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={Wallet}
            title="No accounts yet"
            description="You don't have any accounts. Contact support to get started."
            action={{ label: "Contact Support", href: "/dashboard/support" }}
          />
        </div>
      )}
    </div>
  );
}
