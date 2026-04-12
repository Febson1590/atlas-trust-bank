import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ScrollText, FileSearch } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

const ACTION_FILTERS = [
  "ALL",
  "CREATE_ACCOUNT",
  "UPDATE_ACCOUNT_STATUS",
  "ADMIN_CREDIT",
  "ADMIN_DEBIT",
  "APPROVE_TRANSFER",
  "REJECT_TRANSFER",
  "DELAY_TRANSFER",
  "APPROVE_KYC_DOCUMENT",
  "REJECT_KYC_DOCUMENT",
  "GENERATE_TRANSACTIONS",
  "CREATE_CARD",
  "UPDATE_CARD",
  "SEND_NOTIFICATION",
  "BROADCAST_NOTIFICATION",
  "REPLY_TICKET",
  "UPDATE_TICKET_STATUS",
] as const;

interface PageProps {
  searchParams: Promise<{ page?: string; action?: string }>;
}

export default async function AdminAuditLogsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const actionFilter = params.action || "ALL";
  const limit = 30;
  const skip = (page - 1) * limit;

  const where = actionFilter !== "ALL" ? { action: actionFilter } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const serialized = logs.map((log) => ({
    id: log.id,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    details: log.details as Record<string, unknown> | null,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt.toISOString(),
    admin: log.admin,
  }));

  function formatAction(action: string): string {
    return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function getActionColor(action: string): string {
    if (action.includes("APPROVE") || action.includes("CREATE")) return "text-success";
    if (action.includes("REJECT") || action.includes("DEBIT")) return "text-error";
    if (action.includes("DELAY") || action.includes("UPDATE")) return "text-warning";
    if (action.includes("GENERATE") || action.includes("BROADCAST")) return "text-blue-400";
    return "text-text-secondary";
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <ScrollText className="h-5 w-5 text-navy-950" />
          </div>
          Audit Logs
        </h1>
        <p className="text-text-muted mt-1">{total} log entr{total !== 1 ? "ies" : "y"}</p>
      </div>

      {/* Action Filter */}
      <div className="glass glass-border rounded-xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium text-text-secondary flex-shrink-0">Filter by action:</label>
          <form method="GET" className="flex items-center gap-2 flex-1 flex-wrap">
            <select
              name="action"
              defaultValue={actionFilter}
              className="bg-navy-900/50 border border-border-default rounded-lg py-2 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            >
              {ACTION_FILTERS.map((a) => (
                <option key={a} value={a}>
                  {a === "ALL" ? "All Actions" : formatAction(a)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-sm gold-gradient rounded-lg text-navy-950 font-semibold hover:opacity-90 transition-opacity"
            >
              Filter
            </button>
            {actionFilter !== "ALL" && (
              <a
                href="/admin/audit-logs"
                className="px-3 py-2 text-sm text-text-muted hover:text-text-secondary border border-border-default rounded-lg transition-colors"
              >
                Clear
              </a>
            )}
          </form>
        </div>
      </div>

      {/* Logs Table */}
      {serialized.length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={FileSearch}
            title="No audit logs"
            description={actionFilter !== "ALL" ? "No logs match the selected filter." : "No admin actions have been recorded yet."}
          />
        </div>
      ) : (
        <div className="glass glass-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Admin</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Action</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Target</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Details</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">IP</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {serialized.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-text-primary text-sm font-medium">
                          {log.admin.firstName} {log.admin.lastName}
                        </p>
                        <p className="text-text-muted text-xs">{log.admin.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-text-secondary text-sm">{log.targetType}</p>
                        <p className="text-text-muted text-xs font-mono truncate max-w-[120px]">{log.targetId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.details ? (
                        <details className="text-xs">
                          <summary className="text-text-muted cursor-pointer hover:text-text-secondary transition-colors">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-navy-900/50 rounded-lg text-text-secondary overflow-x-auto max-w-xs text-xs whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted text-sm font-mono">{log.ipAddress || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted text-sm whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </span>
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
                    href={`/admin/audit-logs?page=${page - 1}${actionFilter !== "ALL" ? `&action=${actionFilter}` : ""}`}
                    className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/audit-logs?page=${page + 1}${actionFilter !== "ALL" ? `&action=${actionFilter}` : ""}`}
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
