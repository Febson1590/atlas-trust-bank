import { redirect } from "next/navigation";
import {
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Inbox,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions — Admin — Atlas Trust Bank",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const TYPE_TABS = ["ALL", "CREDIT", "DEBIT"] as const;
const STATUS_TABS = ["ALL", "COMPLETED", "PENDING", "FAILED"] as const;

interface PageProps {
  searchParams: Promise<{ page?: string; type?: string; status?: string }>;
}

export default async function AdminTransactionsPage({
  searchParams,
}: PageProps) {
  // ── Auth ─────────────────────────────────────────────────────
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  // ── Parse params ───────────────��─────────────────────────────
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const typeFilter = params.type || "ALL";
  const statusFilter = params.status || "ALL";

  // ── Build where clause ───────────────────────────────────────
  const where: Record<string, unknown> = {};

  if (typeFilter !== "ALL" && (typeFilter === "CREDIT" || typeFilter === "DEBIT")) {
    where.type = typeFilter;
  }

  if (
    statusFilter !== "ALL" &&
    (statusFilter === "COMPLETED" ||
      statusFilter === "PENDING" ||
      statusFilter === "FAILED")
  ) {
    where.status = statusFilter;
  }

  // ── Fetch data ───────────────────────────────────────────────
  const [transactions, totalCount, summaryData] = await Promise.all([
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
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where: { status: "COMPLETED" },
      select: { type: true, amount: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Summary stats ─────────────���──────────────────────────────
  const totalTransactions = await prisma.transaction.count();

  const totalCredits = summaryData
    .filter((t) => t.type === "CREDIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebits = summaryData
    .filter((t) => t.type === "DEBIT")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // ── URL builder ──────────��───────────────────────────────────
  function filterUrl(overrides: {
    type?: string;
    status?: string;
    page?: string;
  }) {
    const merged = {
      type: typeFilter,
      status: statusFilter,
      ...overrides,
    };
    const parts: string[] = [];
    if (merged.type && merged.type !== "ALL") parts.push(`type=${merged.type}`);
    if (merged.status && merged.status !== "ALL")
      parts.push(`status=${merged.status}`);
    if (merged.page && merged.page !== "1") parts.push(`page=${merged.page}`);
    return `/admin/transactions${parts.length ? `?${parts.join("&")}` : ""}`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────��──────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <Receipt className="h-5 w-5 text-navy-950" />
          </div>
          Transaction History
        </h1>
        <p className="text-text-muted mt-1">
          All transactions across every account
        </p>
      </div>

      {/* ── Summary Cards ─────────────���───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass glass-border rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            Total Transactions
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {totalTransactions.toLocaleString()}
          </p>
        </div>
        <div className="glass glass-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Credits
            </p>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(totalCredits)}
          </p>
        </div>
        <div className="glass glass-border rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-error" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Total Debits
            </p>
          </div>
          <p className="text-2xl font-bold text-error">
            {formatCurrency(totalDebits)}
          </p>
        </div>
      </div>

      {/* ── Filters ─────────���─────────────────────────────────── */}
      <div className="glass glass-border rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mr-2">
            Type:
          </span>

          {TYPE_TABS.map((tab) => {
            const isActive = typeFilter === tab;
            return (
              <a
                key={tab}
                href={filterUrl({ type: tab, page: "1" })}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                  isActive
                    ? tab === "CREDIT"
                      ? "bg-success/15 text-success border-success/30"
                      : tab === "DEBIT"
                        ? "bg-error/15 text-error border-error/30"
                        : "bg-gold-500/15 text-gold-500 border-gold-500/30"
                    : "bg-navy-900 text-text-muted border-border-subtle hover:border-gold-500/30 hover:text-text-secondary"
                )}
              >
                {tab === "ALL" ? "All Types" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </a>
            );
          })}

          <span className="w-px h-5 bg-border-subtle mx-1" />

          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mr-2">
            Status:
          </span>

          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab;
            return (
              <a
                key={tab}
                href={filterUrl({ status: tab, page: "1" })}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                  isActive
                    ? tab === "COMPLETED"
                      ? "bg-success/15 text-success border-success/30"
                      : tab === "PENDING"
                        ? "bg-warning/15 text-warning border-warning/30"
                        : tab === "FAILED"
                          ? "bg-error/15 text-error border-error/30"
                          : "bg-gold-500/15 text-gold-500 border-gold-500/30"
                    : "bg-navy-900 text-text-muted border-border-subtle hover:border-gold-500/30 hover:text-text-secondary"
                )}
              >
                {tab === "ALL"
                  ? "All Status"
                  : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </a>
            );
          })}
        </div>
      </div>

      {/* ── Table / Cards ────────────────────────────────────��── */}
      <div className="glass glass-border rounded-xl overflow-hidden">
        {transactions.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Date
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      User
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Account
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Description
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Type
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Amount
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Status
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "CREDIT";
                    const amount = Number(tx.amount);

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-navy-800/30 transition-colors"
                      >
                        <td className="px-5 py-3.5 text-sm text-text-secondary whitespace-nowrap">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm text-text-primary">
                              {tx.account.user.firstName}{" "}
                              {tx.account.user.lastName}
                            </p>
                            <p className="text-xs text-text-muted">
                              {tx.account.user.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm text-text-primary">
                              {tx.account.label}
                            </p>
                            <p className="text-xs text-text-muted font-mono">
                              {tx.account.accountNumber}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-text-primary max-w-[200px] truncate">
                          {tx.description}
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
            <div className="md:hidden divide-y divide-border-default">
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
                            {tx.account.user.firstName}{" "}
                            {tx.account.user.lastName}
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
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted">
                          {formatDate(tx.createdAt)}
                        </span>
                        <span className="text-xs text-text-muted">
                          {tx.account.label}
                        </span>
                      </div>
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
              <div className="flex items-center justify-between px-5 py-4 border-t border-border-default">
                <p className="text-xs text-text-muted">
                  Page {currentPage} of {totalPages} ({totalCount.toLocaleString()}{" "}
                  transactions)
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 && (
                    <a
                      href={filterUrl({ page: String(currentPage - 1) })}
                      className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                    >
                      Previous
                    </a>
                  )}
                  {currentPage < totalPages && (
                    <a
                      href={filterUrl({ page: String(currentPage + 1) })}
                      className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
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
            icon={Inbox}
            title="No transactions found"
            description={
              typeFilter !== "ALL" || statusFilter !== "ALL"
                ? "No transactions match your current filters. Try adjusting the filter criteria."
                : "No transactions have been recorded yet."
            }
            action={
              typeFilter !== "ALL" || statusFilter !== "ALL"
                ? {
                    label: "Clear Filters",
                    href: "/admin/transactions",
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
