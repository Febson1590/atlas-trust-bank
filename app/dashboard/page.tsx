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
import { formatCurrency, formatDate } from "@/lib/utils";
import AccountCard from "@/components/dashboard/AccountCard";
import TransactionTable from "@/components/dashboard/TransactionTable";
import BalanceChart from "@/components/dashboard/BalanceChart";
import EmptyState from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Fetch user with accounts ──────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      firstName: true,
      lastName: true,
      accounts: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) redirect("/login");

  // ── Calculate total balance ───────────────────────────────
  const totalBalance = user.accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );

  // ── Get all account IDs for transaction query ─────────────
  const accountIds = user.accounts.map((a) => a.id);

  // ── Fetch recent transactions ─────────────────────────────
  const recentTransactions =
    accountIds.length > 0
      ? await prisma.transaction.findMany({
          where: { accountId: { in: accountIds } },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [];

  // ── Build balance chart data from transactions ────────────
  // Aggregate daily balances from the last 30 days of transactions
  const chartData: { date: string; balance: number }[] = [];

  if (recentTransactions.length > 0) {
    // Get the last 30 transactions for chart data
    const chartTransactions = await prisma.transaction.findMany({
      where: { accountId: { in: accountIds } },
      orderBy: { createdAt: "asc" },
      take: 30,
      select: { createdAt: true, balanceAfter: true },
    });

    const seenDates = new Set<string>();
    for (const tx of chartTransactions) {
      const dateStr = formatDate(tx.createdAt);
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        chartData.push({
          date: dateStr,
          balance: Number(tx.balanceAfter),
        });
      }
    }
  }

  // ── Serialize transactions for client component ───────────
  const serializedTransactions = recentTransactions.map((tx) => ({
    id: tx.id,
    description: tx.description,
    type: tx.type,
    amount: Number(tx.amount),
    status: tx.status,
    reference: tx.reference,
    createdAt: tx.createdAt.toISOString(),
  }));

  // ── Monthly summary calculations ──────────────────────────
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
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome Greeting ──────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Welcome back, {user.firstName}
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Here is an overview of your financial portfolio.
        </p>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10">
              <Wallet className="h-4 w-4 text-gold-500" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Balance
            </span>
          </div>
          <p className="text-3xl font-bold gold-text">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Across {user.accounts.length}{" "}
            {user.accounts.length === 1 ? "account" : "accounts"}
          </p>
        </div>

        {/* Monthly Income */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Monthly Income
            </span>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(monthlyIncome)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            This month&apos;s credits
          </p>
        </div>

        {/* Monthly Expenses */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-error/10">
              <TrendingDown className="h-4 w-4 text-error" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Monthly Expenses
            </span>
          </div>
          <p className="text-2xl font-bold text-error">
            {formatCurrency(monthlyExpenses)}
          </p>
          <p className="text-xs text-text-muted mt-1">
            This month&apos;s debits
          </p>
        </div>
      </div>

      {/* ── Quick Actions ─────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/transfer"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <Send className="h-4 w-4 text-gold-500" />
            Transfer Funds
          </Link>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <Receipt className="h-4 w-4 text-gold-500" />
            Pay Bills
          </Link>
          <Link
            href="/dashboard/beneficiaries"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <Users className="h-4 w-4 text-gold-500" />
            Add Beneficiary
          </Link>
        </div>
      </div>

      {/* ── Accounts Grid ─────────────────────────────────────── */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.accounts.map((account) => (
              <AccountCard
                key={account.id}
                id={account.id}
                type={account.type}
                accountNumber={account.accountNumber}
                label={account.label}
                balance={Number(account.balance)}
                currency={account.currency}
                status={account.status}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-navy-800 border border-border-subtle">
            <EmptyState
              icon={Wallet}
              title="No active accounts"
              description="You don't have any active accounts yet. Contact support to get started with your first account."
              action={{ label: "Contact Support", href: "/dashboard/support" }}
            />
          </div>
        )}
      </div>

      {/* ── Balance Chart ─────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          Balance Trend
        </h3>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-5">
          <BalanceChart data={chartData} />
        </div>
      </div>

      {/* ── Recent Transactions ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Recent Transactions
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
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-5">
          <TransactionTable transactions={serializedTransactions} />
        </div>
      </div>
    </div>
  );
}
