import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Wallet,
  PiggyBank,
  TrendingUp,
  Send,
  ArrowDownLeft,
  FileText,
  Copy,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, maskAccountNumber, formatDate, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import TransactionTable from "@/components/dashboard/TransactionTable";
import EmptyState from "@/components/ui/EmptyState";
import type { AccountType } from "@/generated/prisma";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: PageProps) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  // Not found or doesn't belong to user
  if (!account || account.userId !== session.userId) {
    notFound();
  }

  const config = typeConfig[account.type];
  const Icon = config.icon;

  const serializedTransactions = account.transactions.map((tx) => ({
    id: tx.id,
    description: tx.description,
    type: tx.type,
    amount: Number(tx.amount),
    status: tx.status,
    reference: tx.reference,
    createdAt: tx.createdAt.toISOString(),
    currency: account.currency,
  }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Back link */}
      <Link
        href="/dashboard/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Accounts
      </Link>

      {/* Account Header */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border",
                config.bgAccent
              )}
            >
              <Icon className={cn("h-6 w-6", config.accent)} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-text-primary">
                  {account.label || config.label}
                </h2>
                <StatusBadge status={account.status} />
              </div>
              <p className="text-sm text-text-muted mt-0.5">
                {account.currency} · {config.label}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/transfer"
              className="gold-gradient rounded-lg px-4 py-2 text-sm font-semibold text-navy-950 transition-all hover:shadow-md hover:shadow-gold-500/20 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Link>
            <Link
              href="/dashboard/transfer"
              className="rounded-lg bg-navy-700 border border-border-subtle px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 flex items-center gap-1.5"
            >
              <ArrowDownLeft className="h-3.5 w-3.5 text-text-muted" />
              Deposit
            </Link>
            <Link
              href="/dashboard/transactions"
              className="rounded-lg bg-navy-700 border border-border-subtle px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 flex items-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-text-muted" />
              Statements
            </Link>
          </div>
        </div>

        {/* Balance */}
        <div className="mt-6 pt-5 border-t border-border-subtle/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Available Balance
          </span>
          <p className="text-3xl sm:text-4xl font-bold gold-text mt-1">
            {formatCurrency(Number(account.balance), account.currency)}
          </p>
        </div>
      </div>

      {/* Account Details */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-4 sm:p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          Account Info
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Account Number</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-text-primary">
                {account.accountNumber}
              </p>
              <button
                type="button"
                className="text-text-muted hover:text-gold-500 transition-colors"
                title="Copy"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Account Type</p>
            <p className="text-sm text-text-primary">{config.label}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Currency</p>
            <p className="text-sm text-text-primary">{account.currency}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Status</p>
            <StatusBadge status={account.status} />
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Opened</p>
            <p className="text-sm text-text-primary">
              {formatDate(account.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Transactions</p>
            <p className="text-sm text-text-primary">
              {account.transactions.length}{" "}
              {account.transactions.length >= 20 ? "+" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Transactions for this account */}
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
