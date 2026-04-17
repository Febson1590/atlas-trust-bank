import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Send,
  Receipt,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, userFacingAccountStatus } from "@/lib/utils";
import AccountCard from "@/components/dashboard/AccountCard";
import TransactionTable from "@/components/dashboard/TransactionTable";
import BalanceChart from "@/components/dashboard/BalanceChart";
import KycBanner, { KycVerifiedBadge } from "@/components/dashboard/KycBanner";
import EmptyState from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      firstName: true,
      lastName: true,
      kycStatus: true,
      // Load ALL accounts the user owns (ACTIVE, DORMANT, RESTRICTED, FROZEN).
      accounts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) redirect("/login");

  const totalBalance = user.accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  const accountIds = user.accounts.map((a) => a.id);

  const recentTransactions =
    accountIds.length > 0
      ? await prisma.transaction.findMany({
          where: { accountId: { in: accountIds } },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [];

  // Build balance chart from REAL transaction history.
  // For each transaction (sorted chronologically across all accounts),
  // compute a running per-account balance then aggregate to a total.
  // This gives the chart the same number the user sees in the "Total
  // Balance" card, tracked over time. Face values are summed (mixing
  // currencies matches the Total Balance card behavior).
  const chartData: { date: string; balance: number }[] = [];

  if (accountIds.length > 0) {
    const allChartTxs = await prisma.transaction.findMany({
      where: { accountId: { in: accountIds }, status: "COMPLETED" },
      orderBy: { createdAt: "asc" },
      select: {
        accountId: true,
        type: true,
        amount: true,
        createdAt: true,
      },
    });

    if (allChartTxs.length > 0) {
      const acctBals: Record<string, number> = {};
      for (const id of accountIds) acctBals[id] = 0;

      const seenDates = new Set<string>();
      for (const tx of allChartTxs) {
        const delta =
          tx.type === "CREDIT" ? Number(tx.amount) : -Number(tx.amount);
        acctBals[tx.accountId] = (acctBals[tx.accountId] || 0) + delta;

        const total = Object.values(acctBals).reduce((s, v) => s + v, 0);
        const dateStr = formatDate(tx.createdAt);

        // Keep only the latest data-point per date to avoid huge arrays.
        if (seenDates.has(dateStr)) {
          chartData[chartData.length - 1].balance =
            Math.round(total * 100) / 100;
        } else {
          seenDates.add(dateStr);
          chartData.push({
            date: dateStr,
            balance: Math.round(total * 100) / 100,
          });
        }
      }
    }
  }

  const serializedTransactions = recentTransactions.map((tx) => ({
    id: tx.id,
    description: tx.description,
    type: tx.type,
    amount: Number(tx.amount),
    status: tx.status,
    reference: tx.reference,
    createdAt: tx.createdAt.toISOString(),
  }));

  // Monthly summary
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlyTransactions =
    accountIds.length > 0
      ? await prisma.transaction.findMany({
          where: {
            accountId: { in: accountIds },
            createdAt: { gte: startOfMonth },
            status: "COMPLETED",
          },
          select: { type: true, amount: true },
        })
      : [];

  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Hey, {user.firstName}
          <KycVerifiedBadge status={user.kycStatus} />
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Here&apos;s a quick look at your account.
        </p>
      </div>

      {/* KYC status banner — shown for NOT_STARTED, PENDING, REJECTED.
          Hidden for VERIFIED users (they just get the badge above). */}
      <KycBanner status={user.kycStatus} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Balance */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10">
              <Wallet className="h-4 w-4 text-gold-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Balance
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold gold-text">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            {user.accounts.length}{" "}
            {user.accounts.length === 1 ? "account" : "accounts"}
          </p>
        </div>

        {/* Money In */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Money In
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-success">
            {formatCurrency(monthlyIncome)}
          </p>
          <p className="text-xs text-text-muted mt-1">This month</p>
        </div>

        {/* Money Out */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error/10">
              <TrendingDown className="h-4 w-4 text-error" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Money Out
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-error">
            {formatCurrency(monthlyExpenses)}
          </p>
          <p className="text-xs text-text-muted mt-1">This month</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/transfer"
            className="flex items-center gap-2 rounded-lg gold-gradient px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:shadow-md hover:shadow-gold-500/20"
          >
            <Send className="h-4 w-4" />
            Send Money
          </Link>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <Receipt className="h-4 w-4 text-text-muted" />
            Pay Bills
          </Link>
          <Link
            href="/dashboard/beneficiaries"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <Users className="h-4 w-4 text-text-muted" />
            Add Recipient
          </Link>
        </div>
      </div>

      {/* Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Your Accounts
          </h3>
          {user.accounts.length > 0 && (
            <Link
              href="/dashboard/accounts"
              className="text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors"
            >
              View All
            </Link>
          )}
        </div>

        {user.accounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {user.accounts.map((account) => (
              <AccountCard
                key={account.id}
                id={account.id}
                type={account.type}
                accountNumber={account.accountNumber}
                label={account.label}
                balance={Number(account.balance)}
                currency={account.currency}
                status={userFacingAccountStatus(account.status)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-navy-800 border border-border-subtle">
            <EmptyState
              icon={Wallet}
              title="No accounts yet"
              description="Contact support to set up your first account."
              action={{ label: "Contact Support", href: "/dashboard/support" }}
            />
          </div>
        )}
      </div>

      {/* Balance Chart */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          Balance History
        </h3>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-5">
          <BalanceChart data={chartData} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Recent Activity
          </h3>
          {serializedTransactions.length > 0 && (
            <Link
              href="/dashboard/transactions"
              className="text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors"
            >
              View All
            </Link>
          )}
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-5">
          <TransactionTable transactions={serializedTransactions} />
        </div>
      </div>
    </div>
  );
}
