import { redirect } from "next/navigation";
import Link from "next/link";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, getInitials, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Management — Atlas Trust Bank",
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  // ── Session + admin check ──────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!admin || admin.role !== "ADMIN") redirect("/dashboard");

  // ── Parse params ───────────────────────────────────────────
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1"));
  const limit = 20;
  const search = params.search?.trim() ?? "";
  const statusFilter = params.status?.toUpperCase() ?? "";

  // ── Build where clause ─────────────────────────────────────
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (statusFilter && ["ACTIVE", "SUSPENDED", "FROZEN"].includes(statusFilter)) {
    where.status = statusFilter;
  }

  // ── Fetch users ────────────────────────────────────────────
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        kycStatus: true,
        createdAt: true,
        accounts: {
          select: { id: true, balance: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // ── Filter pills ───────────────────────────────────────────
  const filters = [
    { label: "All", value: "", count: null },
    { label: "Active", value: "ACTIVE", count: null },
    { label: "Suspended", value: "SUSPENDED", count: null },
    { label: "Frozen", value: "FROZEN", count: null },
  ];

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (search && !("search" in overrides)) p.set("search", search);
    for (const [key, val] of Object.entries(overrides)) {
      if (val) p.set(key, val);
    }
    const qs = p.toString();
    return `/admin/users${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Users</h2>
          <p className="text-sm text-text-muted mt-0.5">
            {totalCount} total {totalCount === 1 ? "user" : "users"}
          </p>
        </div>

        {/* Search */}
        <form action="/admin/users" method="GET" className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email..."
            className="w-full rounded-lg bg-navy-800 border border-border-subtle pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/25 transition-colors"
          />
          {statusFilter && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
        </form>
      </div>

      {/* ── Filter Pills ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive =
            (!statusFilter && filter.value === "") ||
            statusFilter === filter.value;
          return (
            <Link
              key={filter.value}
              href={buildUrl({
                status: filter.value,
                ...(search ? { search } : {}),
              })}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-gold-500/15 text-gold-500 border border-gold-500/25"
                  : "bg-navy-800 text-text-secondary border border-border-subtle hover:border-gold-500/20 hover:text-text-primary"
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* ── Users Table / Cards ─────────────────────────────────── */}
      {users.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      User
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Role
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      KYC
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Accounts
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Total Balance
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {users.map((user) => {
                    const balance = user.accounts.reduce(
                      (sum, acc) => sum + Number(acc.balance),
                      0
                    );
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-navy-700/50 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="flex items-center gap-3"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 border border-border-subtle text-xs font-bold text-gold-500 shrink-0">
                              {getInitials(user.firstName, user.lastName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-text-primary truncate hover:text-gold-500 transition-colors">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-text-muted truncate">
                                {user.email}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              user.role === "ADMIN"
                                ? "bg-gold-500/15 text-gold-500 border border-gold-500/20"
                                : "bg-navy-600/30 text-text-secondary border border-navy-600/30"
                            )}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={user.kycStatus} />
                        </td>
                        <td className="px-4 py-3.5 text-sm text-text-secondary">
                          {user.accounts.length}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-medium text-text-primary">
                          {formatCurrency(balance)}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-text-muted whitespace-nowrap">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {users.map((user) => {
              const balance = user.accounts.reduce(
                (sum, acc) => sum + Number(acc.balance),
                0
              );
              return (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="block rounded-xl bg-navy-800 border border-border-subtle p-4 transition-all hover:border-gold-500/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-700 border border-border-subtle text-xs font-bold text-gold-500 shrink-0">
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3 pt-3 border-t border-border-subtle">
                    <div>
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">
                        Role
                      </p>
                      <p className="text-xs font-medium text-text-secondary mt-0.5">
                        {user.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">
                        Accounts
                      </p>
                      <p className="text-xs font-medium text-text-secondary mt-0.5">
                        {user.accounts.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">
                        Balance
                      </p>
                      <p className="text-xs font-medium text-text-primary mt-0.5">
                        {formatCurrency(balance)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Pagination ───────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                {page > 1 && (
                  <Link
                    href={buildUrl({
                      page: String(page - 1),
                      ...(statusFilter ? { status: statusFilter } : {}),
                      ...(search ? { search } : {}),
                    })}
                    className="flex items-center gap-1 rounded-lg bg-navy-800 border border-border-subtle px-3 py-2 text-sm font-medium text-text-secondary hover:border-gold-500/20 hover:text-text-primary transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={buildUrl({
                      page: String(page + 1),
                      ...(statusFilter ? { status: statusFilter } : {}),
                      ...(search ? { search } : {}),
                    })}
                    className="flex items-center gap-1 rounded-lg bg-navy-800 border border-border-subtle px-3 py-2 text-sm font-medium text-text-secondary hover:border-gold-500/20 hover:text-text-primary transition-all"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={Users}
            title="No users found"
            description={
              search
                ? `No users matching "${search}". Try a different search term.`
                : "No users registered yet."
            }
          />
        </div>
      )}
    </div>
  );
}
