import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, maskAccountNumber, cn, formatDate } from "@/lib/utils";
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
    label: "Checking Account",
    accent: "text-gold-500",
    bgAccent: "bg-gold-500/10 border-gold-500/20",
  },
  SAVINGS: {
    icon: PiggyBank,
    label: "Savings Account",
    accent: "text-success",
    bgAccent: "bg-success/10 border-success/20",
  },
  INVESTMENT: {
    icon: TrendingUp,
    label: "Investment Account",
    accent: "text-blue-400",
    bgAccent: "bg-blue-400/10 border-blue-400/20",
  },
};

export default async function AccountsPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch accounts with transaction counts ─────────────────
  const accounts = await prisma.account.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { transactions: true },
      },
      cards: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
  });

  // ── Calculate total balance ────────────────────────────────
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  const activeAccounts = accounts.filter((a) => a.status === "ACTIVE");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Your Accounts</h2>
        <p className="text-sm text-text-muted mt-1">
          Manage and monitor all your bank accounts
        </p>
      </div>

      {/* ── Total Balance Card ──────────────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10">
                <Wallet className="h-4 w-4 text-gold-500" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Total Portfolio Balance
              </span>
            </div>
            <p className="text-3xl font-bold gold-text">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Across {accounts.length}{" "}
              {accounts.length === 1 ? "account" : "accounts"} ({activeAccounts.length} active)
            </p>
          </div>
          <Link
            href="/dashboard/transfer"
            className="gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 flex items-center gap-2 self-start sm:self-center"
          >
            <ArrowUpRight className="h-4 w-4" />
            Transfer Funds
          </Link>
        </div>
      </div>

      {/* ── Account Cards Grid ──────────────────────────────── */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => {
            const config = typeConfig[account.type];
            const Icon = config.icon;
            const txCount = account._count.transactions;
            const cardCount = account.cards.length;

            return (
              <div
                key={account.id}
                className="card-shine rounded-xl bg-navy-800 border border-border-subtle p-6 transition-all duration-200 hover:border-gold-500/30 hover:shadow-lg hover:shadow-navy-950/50"
              >
                {/* Top — Icon, Type, Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-lg border",
                        config.bgAccent
                      )}
                    >
                      <Icon className={cn("h-5 w-5", config.accent)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        {account.label}
                      </p>
                      <p className="text-xs text-text-muted">{config.label}</p>
                    </div>
                  </div>
                  <StatusBadge status={account.status} />
                </div>

                {/* Balance */}
                <div className="mb-4">
                  <p className="text-2xl font-bold text-text-primary tracking-tight">
                    {formatCurrency(Number(account.balance), account.currency)}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {account.currency} Balance
                  </p>
                </div>

                {/* Account Details */}
                <div className="space-y-2 pt-4 border-t border-border-subtle/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Account No.</span>
                    <span className="text-xs font-mono text-text-secondary">
                      {maskAccountNumber(account.accountNumber)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Transactions</span>
                    <span className="text-xs text-text-secondary">
                      {txCount} {txCount === 1 ? "transaction" : "transactions"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Active Cards</span>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3 text-text-muted" />
                      <span className="text-xs text-text-secondary">
                        {cardCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Opened</span>
                    <span className="text-xs text-text-secondary">
                      {formatDate(account.createdAt)}
                    </span>
                  </div>
                </div>

                {/* View Details Link */}
                <div className="mt-4 pt-4 border-t border-border-subtle/50">
                  <Link
                    href={`/dashboard/accounts/${account.id}`}
                    className="flex items-center justify-center gap-2 w-full bg-navy-700/60 border border-border-subtle rounded-lg py-2.5 text-xs font-medium text-text-secondary hover:text-gold-500 hover:border-gold-500/30 transition-all"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Account Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={Wallet}
            title="No accounts found"
            description="You don't have any bank accounts yet. Contact support to get started."
            action={{ label: "Contact Support", href: "/dashboard/support" }}
          />
        </div>
      )}
    </div>
  );
}
