import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Wallet,
  DollarSign,
  Send,
  ShieldCheck,
  HelpCircle,
  ArrowLeftRight,
  Clock,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, timeAgo, getInitials } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard — Atlas Trust Bank",
};

export default async function AdminDashboardPage() {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  // ── Verify admin ───────────────────────────────────────────
  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!admin || admin.role !== "ADMIN") redirect("/dashboard");

  // ── Fetch stats in parallel ────────────────────────────────
  const [
    totalUsers,
    totalAccounts,
    totalBalanceResult,
    pendingTransfers,
    pendingKyc,
    openTickets,
    recentTransactions,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.account.aggregate({
      _sum: { balance: true },
    }),
    prisma.transfer.count({
      where: { status: "PENDING" },
    }),
    prisma.kycDocument.count({
      where: { status: "PENDING" },
    }),
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        account: {
          select: {
            accountNumber: true,
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        kycStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const totalBalance = Number(totalBalanceResult._sum.balance ?? 0);

  // ── Stats cards data ───────────────────────────────────────
  const stats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Accounts",
      value: totalAccounts.toLocaleString(),
      icon: Wallet,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Total Assets",
      value: formatCurrency(totalBalance),
      icon: DollarSign,
      color: "text-gold-500",
      bgColor: "bg-gold-500/10",
    },
    {
      label: "Pending Transfers",
      value: pendingTransfers.toLocaleString(),
      icon: Send,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Pending KYC",
      value: pendingKyc.toLocaleString(),
      icon: ShieldCheck,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Open Tickets",
      value: openTickets.toLocaleString(),
      icon: HelpCircle,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Stats Cards Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-navy-800 border border-border-subtle p-5 transition-all hover:border-gold-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <Users className="h-4 w-4 text-gold-500" />
            Manage Users
          </Link>
          <Link
            href="/admin/transfers"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <Send className="h-4 w-4 text-gold-500" />
            Review Transfers
          </Link>
          <Link
            href="/admin/kyc"
            className="flex items-center gap-2 rounded-lg bg-navy-800 border border-border-subtle px-4 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-gold-500/30 hover:bg-navy-700"
          >
            <ShieldCheck className="h-4 w-4 text-gold-500" />
            Review KYC
          </Link>
        </div>
      </div>

      {/* ── Two-column layout: Activity + New Users ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Recent Activity
            </h3>
            <Link
              href="/admin/transactions"
              className="flex items-center gap-1 text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-xl bg-navy-800 border border-border-subtle divide-y divide-border-subtle">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        tx.type === "CREDIT"
                          ? "bg-success/10"
                          : "bg-error/10"
                      }`}
                    >
                      <ArrowLeftRight
                        className={`h-4 w-4 ${
                          tx.type === "CREDIT"
                            ? "text-success"
                            : "text-error"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-text-muted">
                        {tx.account.user.firstName} {tx.account.user.lastName} — {timeAgo(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold whitespace-nowrap ${
                      tx.type === "CREDIT"
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <Clock className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No recent transactions</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Recent Signups
            </h3>
            <Link
              href="/admin/users"
              className="flex items-center gap-1 text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-xl bg-navy-800 border border-border-subtle divide-y divide-border-subtle">
            {recentUsers.length > 0 ? (
              recentUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/users/${u.id}`}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-navy-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-700 border border-border-subtle text-xs font-bold text-gold-500">
                      {getInitials(u.firstName, u.lastName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                    <StatusBadge status={u.kycStatus} />
                    <span className="text-[11px] text-text-muted">
                      {formatDate(u.createdAt)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <UserPlus className="h-8 w-8 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted">No users yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
