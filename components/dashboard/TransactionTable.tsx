import {
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type {
  TransactionType,
  TransactionStatus,
} from "@/app/generated/prisma";

interface TransactionRow {
  id: string;
  description: string;
  type: TransactionType;
  amount: number | string;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
  currency?: string;
}

interface TransactionTableProps {
  transactions: TransactionRow[];
  className?: string;
}

export default function TransactionTable({
  transactions,
  className,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No transactions yet"
        description="Your transaction history will appear here once you make or receive your first payment."
      />
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle text-left">
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Date
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Description
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Type
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                Amount
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Status
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Reference
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isCredit = tx.type === "CREDIT";
              const amount =
                typeof tx.amount === "string"
                  ? parseFloat(tx.amount)
                  : tx.amount;

              return (
                <tr
                  key={tx.id}
                  className="border-b border-border-subtle/50 hover:bg-navy-800/40 transition-colors"
                >
                  <td className="py-3.5 pr-4 text-sm text-text-secondary whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-text-primary max-w-[200px] truncate">
                    {tx.description}
                  </td>
                  <td className="py-3.5 pr-4">
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
                      "py-3.5 pr-4 text-sm font-semibold text-right whitespace-nowrap",
                      isCredit ? "text-success" : "text-error"
                    )}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(amount, tx.currency ?? "USD")}
                  </td>
                  <td className="py-3.5 pr-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3.5 text-xs text-text-muted font-mono">
                    {tx.reference}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {transactions.map((tx) => {
          const isCredit = tx.type === "CREDIT";
          const amount =
            typeof tx.amount === "string"
              ? parseFloat(tx.amount)
              : tx.amount;

          return (
            <div
              key={tx.id}
              className="rounded-lg bg-navy-800 border border-border-subtle p-4"
            >
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
                      {formatDate(tx.createdAt)}
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
                    {formatCurrency(amount, tx.currency ?? "USD")}
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
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
    </div>
  );
}
