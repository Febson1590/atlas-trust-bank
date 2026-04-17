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
        <AccountActions mode="header" users={allUsers} />
      </div>

      {/* Search */}
      <div className="glass glass-border rounded-xl p-4">
        <form method="GET" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by account number..."
              className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-colors"
            />
          </div>
          <div className="flex items-stretch gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-initial gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity"
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
          </div>
        </form>
      </div>

      {/* Content — one card per account. Grid on desktop so admins see
          multiple accounts at a glance; single column on mobile so action
          buttons have room to breathe. Card layout (vs the old <table>)
          also fixes the overflow-hidden dropdown clipping bug — no floating
          menus that disappear below the fold on the last rows. */}
      {serialized.length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={Users}
            title="No accounts found"
            description={search ? "No accounts match your search." : "No accounts have been created yet."}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {serialized.map((account) => (
            <div
              key={account.id}
              className="glass glass-border rounded-xl overflow-hidden flex flex-col"
            >
              {/* Top row — user + status */}
              <div className="flex items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border-default">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-800 border border-border-default flex-shrink-0">
                    <span className="text-sm font-semibold gold-text">
                      {account.user.firstName.charAt(0)}
                      {account.user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-primary font-medium truncate">
                      {account.user.firstName} {account.user.lastName}
                    </p>
                    <p className="text-text-muted text-xs truncate">
                      {account.user.email}
                    </p>
                  </div>
                </div>
                <StatusBadge status={account.status} />
              </div>

              {/* Account details */}
              <div className="px-4 sm:px-6 py-4 space-y-3 flex-1">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Account Number
                    </p>
                    <p className="text-text-primary font-mono break-all">
                      {account.accountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Type
                    </p>
                    <p className="text-text-primary capitalize">
                      {account.type.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Created
                    </p>
                    <p className="text-text-muted text-xs">
                      {formatDate(account.createdAt)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-text-muted text-xs uppercase tracking-wider mb-0.5">
                      Balance
                    </p>
                    <p className="text-text-primary font-semibold text-lg">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons — always visible at the bottom of each
                  card. No floating dropdown, no absolute positioning,
                  no clipping. See AccountActions.tsx. */}
              <div className="px-4 sm:px-6 py-4 border-t border-border-default/50 bg-navy-900/20">
                <AccountActions mode="row" account={account} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
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
  );
}
