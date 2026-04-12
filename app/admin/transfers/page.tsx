import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeftRight, Inbox } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import TransferActions from "./TransferActions";

export const dynamic = "force-dynamic";

const STATUS_TABS = ["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "REJECTED"] as const;

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminTransfersPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const statusFilter = params.status || "ALL";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = statusFilter !== "ALL"
    ? { status: statusFilter as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REJECTED" }
    : {};

  const [transfers, total, statusCounts] = await Promise.all([
    prisma.transfer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        fromAccount: {
          select: {
            accountNumber: true,
            label: true,
            currency: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        toAccount: {
          select: { accountNumber: true, label: true },
        },
        beneficiary: {
          select: { name: true, bankName: true },
        },
      },
    }),
    prisma.transfer.count({ where }),
    Promise.all(
      STATUS_TABS.filter((s) => s !== "ALL").map(async (s) => ({
        status: s,
        count: await prisma.transfer.count({ where: { status: s as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REJECTED" } }),
      }))
    ),
  ]);

  const totalAll = statusCounts.reduce((sum, s) => sum + s.count, 0);
  const totalPages = Math.ceil(total / limit);

  const serialized = transfers.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    currency: t.currency,
    status: t.status,
    reference: t.reference,
    description: t.description,
    recipientName: t.recipientName,
    recipientBank: t.recipientBank,
    recipientAcct: t.recipientAcct,
    adminNote: t.adminNote,
    createdAt: t.createdAt.toISOString(),
    processedAt: t.processedAt?.toISOString() ?? null,
    fromAccount: t.fromAccount,
    toAccount: t.toAccount,
    beneficiary: t.beneficiary,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <ArrowLeftRight className="h-5 w-5 text-navy-950" />
          </div>
          Transfer Management
        </h1>
        <p className="text-text-muted mt-1">{total} transfer{total !== 1 ? "s" : ""} {statusFilter !== "ALL" ? `(${statusFilter.toLowerCase()})` : ""}</p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count = tab === "ALL" ? totalAll : statusCounts.find((s) => s.status === tab)?.count || 0;
          const isActive = statusFilter === tab;
          return (
            <a
              key={tab}
              href={`/admin/transfers${tab !== "ALL" ? `?status=${tab}` : ""}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "gold-gradient text-navy-950"
                  : "glass glass-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-navy-950/20 text-navy-950" : "bg-navy-800 text-text-muted"
              }`}>
                {count}
              </span>
            </a>
          );
        })}
      </div>

      {/* Table */}
      {serialized.length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={Inbox}
            title="No transfers found"
            description={statusFilter !== "ALL" ? `No ${statusFilter.toLowerCase()} transfers.` : "No transfers have been made yet."}
          />
        </div>
      ) : (
        <div className="glass glass-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Reference</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">From</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Recipient</th>
                  <th className="text-right px-6 py-4 text-text-muted font-medium">Amount</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Date</th>
                  <th className="text-right px-6 py-4 text-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {serialized.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-navy-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-text-primary text-xs">{transfer.reference}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-text-primary text-sm">
                          {transfer.fromAccount.user.firstName} {transfer.fromAccount.user.lastName}
                        </p>
                        <p className="text-text-muted text-xs font-mono">
                          {transfer.fromAccount.accountNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-text-primary text-sm">
                          {transfer.recipientName || transfer.beneficiary?.name || "—"}
                        </p>
                        <p className="text-text-muted text-xs">
                          {transfer.recipientBank || transfer.beneficiary?.bankName || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-text-primary font-semibold">
                        {formatCurrency(transfer.amount, transfer.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={transfer.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted text-sm">{formatDate(transfer.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(transfer.status === "PENDING" || transfer.status === "PROCESSING") ? (
                        <TransferActions transfer={transfer} />
                      ) : (
                        <span className="text-text-muted text-xs">
                          {transfer.adminNote && (
                            <span title={transfer.adminNote} className="cursor-help underline decoration-dashed">
                              Note
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-default">
              <p className="text-sm text-text-muted">
                Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <a
                    href={`/admin/transfers?page=${page - 1}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                    className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/transfers?page=${page + 1}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                    className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                  >
                    Next
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
