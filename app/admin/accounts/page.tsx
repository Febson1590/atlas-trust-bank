import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Landmark, Search, Users } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import AccountActions from "./AccountActions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminAccountsPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search ? { accountNumber: { contains: search } } : {};

  const [accounts, total, allUsers] = await Promise.all([
    prisma.account.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.account.count({ where }),
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serialized = accounts.map((a: any) => ({
    id: a.id,
    userId: a.userId,
    accountNumber: a.accountNumber,
    type: a.type,
    label: a.label,
    balance: Number(a.balance),
    currency: a.currency,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    user: a.user,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
              <Landmark className="h-5 w-5 text-navy-950" />
            </div>
            Accounts Management
          </h1>
          <p className="text-text-muted mt-1">
            {total} total account{total !== 1 ? "s" : ""}
          </p>
        </div>
        <AccountActions
          mode="header"
          users={allUsers}
        />
      </div>

      {/* Search */}
      <div className="glass glass-border rounded-xl p-4">
        <form method="GET" className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by account number..."
              className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity"
          >
            Search
          </button>
          {search && (
            <a
              href="/admin/accounts"
              className="px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary border border-border-default rounded-lg transition-colors"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      {/* Table */}
      {serialized.length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={Users}
            title="No accounts found"
            description={search ? "No accounts match your search." : "No accounts have been created yet."}
          />
        </div>
      ) : (
        <div className="glass glass-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Account Number</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">User</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Type</th>
                  <th className="text-right px-6 py-4 text-text-muted font-medium">Balance</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Currency</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Status</th>
                  <th className="text-left px-6 py-4 text-text-muted font-medium">Created</th>
                  <th className="text-right px-6 py-4 text-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {serialized.map((account) => (
                  <tr
                    key={account.id}
                    className="hover:bg-navy-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-text-primary">{account.accountNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-text-primary font-medium">
                          {account.user.firstName} {account.user.lastName}
                        </p>
                        <p className="text-text-muted text-xs">{account.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-secondary capitalize">
                        {account.type.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-text-primary font-semibold">
                        {formatCurrency(account.balance, account.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-secondary">{account.currency}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={account.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted">{formatDate(account.createdAt)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <AccountActions
                        mode="row"
                        account={account}
                      />
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
                    href={`/admin/accounts?page=${page - 1}${search ? `&search=${search}` : ""}`}
                    className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                  >
                    Previous
                  </a>
                )}
                {page < totalPages && (
                  <a
                    href={`/admin/accounts?page=${page + 1}${search ? `&search=${search}` : ""}`}
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
