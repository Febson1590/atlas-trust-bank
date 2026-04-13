import { redirect } from "next/navigation";
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Download,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { TransactionType, TransactionStatus } from "@/generated/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
};

interface SearchParams {
  type?: string;
  status?: string;
  page?: string;
}

const PAGE_SIZE = 25;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;

  // ── Parse filters ──────────────────────────────────────────
  const typeFilter = params.type as TransactionType | undefined;
  const statusFilter = params.status as TransactionStatus | undefined;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));

  // ── Get user accounts ──────────────────────────────────────
  const accounts = await prisma.account.findMany({
    where: { userId: session.userId },
    select: { id: true },
  });

  const accountIds = accounts.map((a) => a.id);

  if (accountIds.length === 0) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Transactions</h2>
          <p className="text-sm text-text-muted mt-1">
            View all your transaction history
          </p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Your transaction history will appear here once you start making transfers."
          />
        </div>
      </div>
    );
  }

  // ── Build where clause ─────────────────────────────────────
  const where: Record<string, unknown> = {
    accountId: { in: accountIds },
  };

  if (typeFilter && (typeFilter === "CREDIT" || typeFilter === "DEBIT")) {
    where.type = typeFilter;
  }

  if (
    statusFilter &&
    (statusFilter === "COMPLETED" ||
      statusFilter === "PENDING" ||
      statusFilter === "FAILED")
  ) {
    where.status = statusFilter;
  }

  // ── Count + fetch transactions ─────────────────────────────
  const [totalCount, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        account: {
          select: {
            label: true,
            accountNumber: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Summary stats ──────────────────────────────────────────
  const allTransactions = await prisma.transaction.findMany({
    where: { accountId: { in: accountIds }, status: "COMPLETED" },
    select: { type: true, amount: true },
  });

  const totalCredit = allTransactions
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebit = allTransactions
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // ── Build filter URL helper ────────────────────────────────
  function filterUrl(overrides: Partial<SearchParams>) {
    const merged = { type: typeFilter, status: statusFilter, ...overrides };
    const parts: string[] = [];
    if (merged.type) parts.push(`type=${merged.type}`);
    if (merged.status) parts.push(`status=${merged.status}`);
    if (merged.page && merged.page !== "1") parts.push(`page=${merged.page}`);
    return `/dashboard/transactions${parts.length ? `?${parts.join("&")}` : ""}`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Transactions</h2>
        <p className="text-sm text-text-muted mt-1">
          View and filter your complete transaction history
        </p>
      </div>

      {/* ── Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            Total Transactions
          </p>
          <p className="text-2xl font-bold text-text-primary">{totalCount}</p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Credits
            </p>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(totalCredit)}
          </p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-error" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Debits
            </p>
          </div>
          <p className="text-2xl font-bold text-error">
            {formatCurrency(totalDebit)}
          </p>
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mr-2">
            Filter:
          </span>

          {/* Type Filters */}
          <a
            href={filterUrl({ type: undefined, page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              !typeFilter
                ? "bg-gold-500/15 text-gold-500 border-gold-500/30"
                : "bg-navy-900 text-text-muted border-border-subtle hover:border-gold-500/30 hover:text-text-secondary"
            )}
          >
            All Types
          </a>
          <a
            href={filterUrl({ type: "CREDIT", page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              typeFilter === "CREDIT"
                ? "bg-success/15 text-success border-success/30"
                : "bg-navy-900 text-text-muted border-border-subtle hover:border-success/30 hover:text-text-secondary"
            )}
          >
            Credits
          </a>
          <a
            href={filterUrl({ type: "DEBIT", page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              typeFilter === "DEBIT"
                ? "bg-error/15 text-error border-error/30"
                : "bg-navy-900 text-text-muted border-border-subtle hover:border-error/30 hover:text-text-secondary"
            )}
          >
            Debits
          </a>

          <span className="w-px h-5 bg-border-subtle mx-1" />

          {/* Status Filters */}
          <a
            href={filterUrl({ status: undefined, page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              !statusFilter
                ? "bg-gold-500/15 text-gold-500 border-gold-500/30"
                : "bg-navy-900 text-text-muted border-border-subtle hover:border-gold-500/30 hover:text-text-secondary"
            )}
          >
            All Status
          </a>
          <a
            href={filterUrl({ status: "COMPLETED", page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              statusFilter === "COMPLETED"
                ? "bg-success/15 text-success border-success/30"
                : "bg-navy-900 text-text-muted border-border-subtle hover:border-success/30 hover:text-text-secondary"
            )}
          >
            Completed
          </a>
          <a
            href={filterUrl({ status: "PENDING", page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              statusFilter === "PENDING"
                ? "bg-warning/15 text-warning border-warning/30"
                : "bg-navy-900 text-text-muted border-border-subtle hover:border-warning/30 hover:text-text-secondary"
            )}
          >
            Pending
          </a>
          <a
            href={filterUrl({ status: "FAILED", page: "1" })}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition-all",
              statusFilter === "FAILED"
                ? "bg-error/15 text-error border-error/30"
                : "bg-navy-900 text-text-muted border-border-subtle hover:border-error/30 hover:text-text-secondary"
            )}
          >
            Failed
          </a>
        </div>
      </div>

      {/* ── Transaction Table ───────────────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle">
        {transactions.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-subtle text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Date
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Description
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Account
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Type
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "CREDIT";
                    const amount = Number(tx.amount);

                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-border-subtle/50 hover:bg-navy-700/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-primary max-w-[220px] truncate">
                          {tx.description}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-text-muted whitespace-nowrap">
                          {tx.account.label}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {isCredit ? (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5 text-error" />
                            )}
                            <span
                              className={cn(
                                "text-xs font-medium",
                                isCredit ? "text-success" : "text-error"
                              )}
                            >
                              {isCredit ? "Credit" : "Debit"}
                            </span>
                          </div>
                        </td>
                        <td
                          className={cn(
                            "px-5 py-3.5 text-sm font-semibold text-right whitespace-nowrap",
                            isCredit ? "text-success" : "text-error"
                          )}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(amount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={tx.status} />
                        </td>
                        <td className="px-5 py-3.5 text-xs text-text-muted font-mono">
                          {tx.reference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-border-subtle/50">
              {transactions.map((tx) => {
                const isCredit = tx.type === "CREDIT";
                const amount = Number(tx.amount);

                return (
                  <div key={tx.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            isCredit
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary leading-tight">
                            {tx.description}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {formatDate(tx.createdAt)} &middot; {tx.account.label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isCredit ? "text-success" : "text-error"
                          )}
                        >
                          {isCredit ? "+" : "-"}
                          {formatCurrency(amount)}
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={tx.status} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle/30">
                      <span className="text-xs text-text-muted">
                        {isCredit ? "Credit" : "Debit"}
                      </span>
                      <span className="text-xs text-text-muted font-mono">
                        {tx.reference}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted">
                  Page {currentPage} of {totalPages} ({totalCount} transactions)
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <a
                      href={filterUrl({ page: String(currentPage - 1) })}
                      className="rounded-lg bg-navy-700 border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-gold-500/30 transition-all"
                    >
                      Previous
                    </a>
                  )}
                  {currentPage < totalPages && (
                    <a
                      href={filterUrl({ page: String(currentPage + 1) })}
                      className="rounded-lg bg-navy-700 border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-gold-500/30 transition-all"
                    >
                      Next
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            description={
              typeFilter || statusFilter
                ? "No transactions match your current filters. Try adjusting the filter criteria."
                : "Your transaction history will appear here once you start making transfers."
            }
            action={
              typeFilter || statusFilter
                ? {
                    label: "Clear Filters",
                    href: "/dashboard/transactions",
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
