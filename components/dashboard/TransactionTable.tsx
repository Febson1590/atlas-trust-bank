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
} from "@/generated/prisma";

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
        title="No activity yet"
        description="Your transactions will show up here once you send or receive money."
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
                Transaction
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                Date
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted text-right">
                Amount
              </th>
              <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-text-muted w-24">
                Status
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
              const showStatus = tx.status !== "COMPLETED";

              return (
                <tr
                  key={tx.id}
                  className="border-b border-border-subtle/50 hover:bg-navy-800/40 transition-colors"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                          isCredit ? "bg-success/10 text-success" : "bg-error/10 text-error"
                        )}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-sm text-text-primary truncate max-w-[200px]">
                        {tx.description}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-text-secondary whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td
                    className={cn(
                      "py-3.5 pr-4 text-sm font-semibold text-right whitespace-nowrap",
                      isCredit ? "text-success" : "text-text-primary"
                    )}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(amount, tx.currency ?? "USD")}
                  </td>
                  <td className="py-3.5">
                    {showStatus ? (
                      <StatusBadge status={tx.status} />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-2">
        {transactions.map((tx) => {
          const isCredit = tx.type === "CREDIT";
          const amount =
            typeof tx.amount === "string"
              ? parseFloat(tx.amount)
              : tx.amount;
          const showStatus = tx.status !== "COMPLETED";

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-3 border-b border-border-subtle/50 last:border-0"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                  isCredit ? "bg-success/10 text-success" : "bg-error/10 text-error"
                )}
              >
                {isCredit ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {tx.description}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-text-muted">
                    {formatDate(tx.createdAt)}
                  </p>
                  {showStatus && <StatusBadge status={tx.status} />}
                </div>
              </div>
              <p
                className={cn(
                  "text-sm font-semibold whitespace-nowrap",
                  isCredit ? "text-success" : "text-text-primary"
                )}
              >
                {isCredit ? "+" : "-"}
                {formatCurrency(amount, tx.currency ?? "USD")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
