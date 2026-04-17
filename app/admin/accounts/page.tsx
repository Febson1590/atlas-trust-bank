import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Landmark, Search, Users } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import AccountActions from "./AccountActions";
import UserAccountsGroup from "./UserAccountsGroup";

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
  const limit = 20; // now = users per page, not accounts
  const skip = (page - 1) * limit;

  // Search matches users by name OR email OR account number. Then we
  // page on users and pull each user's full account list so the user
  // always sees all their accounts together.
  const userWhere = search
    ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { accounts: { some: { accountNumber: { contains: search } } } },
        ],
        role: "USER" as const,
      }
    : { role: "USER" as const };

  const [users, total, allUsersForCreate] = await Promise.all([
    prisma.user.findMany({
      where: userWhere,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        accounts: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            accountNumber: true,
            type: true,
            label: true,
            balance: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
      },
    }),
    prisma.user.count({ where: userWhere }),
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // Serialize Decimal balances and Date fields.
  const serializedUsers = users
    .filter((u) => u.accounts.length > 0) // hide users with no accounts
    .map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      accounts: u.accounts.map((a) => ({
        id: a.id,
        accountNumber: a.accountNumber,
        type: a.type,
        label: a.label ?? "",
        balance: Number(a.balance),
        currency: a.currency,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
        user: {
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
        },
      })),
    }));

  const totalAccounts = serializedUsers.reduce(
    (sum, u) => sum + u.accounts.length,
    0
  );

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
            {serializedUsers.length} user
            {serializedUsers.length !== 1 ? "s" : ""} · {totalAccounts}{" "}
            account{totalAccounts !== 1 ? "s" : ""}
          </p>
        </div>
        <AccountActions mode="header" users={allUsersForCreate} />
      </div>

      {/* Search */}
      <div className="glass glass-border rounded-xl p-4">
        <form
          method="GET"
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name, email, or account number..."
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

      {/* One card per USER. Click to expand and see their accounts + act
          on them. Search defaults to collapsed list for the short view,
          auto-expands all cards when a search term is active so admins
          can immediately see which accounts matched. */}
      {serializedUsers.length === 0 ? (
        <div className="glass glass-border rounded-xl">
          <EmptyState
            icon={Users}
            title="No accounts found"
            description={
              search
                ? `No users or accounts match "${search}".`
                : "No user accounts have been created yet."
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {serializedUsers.map((u) => (
            <UserAccountsGroup
              key={u.id}
              user={{
                id: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
              }}
              accounts={u.accounts}
              defaultOpen={!!search}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Showing {skip + 1}–{Math.min(skip + limit, total)} of {total} user
            {total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`/admin/accounts?page=${page - 1}${
                  search ? `&search=${search}` : ""
                }`}
                className="px-3 py-1.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/accounts?page=${page + 1}${
                  search ? `&search=${search}` : ""
                }`}
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
