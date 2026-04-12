import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  Shield,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  Snowflake,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime, timeAgo, getInitials, cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Details — Atlas Trust Bank",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  // ── Session + admin check ──────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });
  if (!admin || admin.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;

  // ── Fetch user with all related data ───────────────────────
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      kycStatus: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      zipCode: true,
      emailVerified: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      accounts: {
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
        orderBy: { createdAt: "desc" },
      },
      kycDocuments: {
        select: {
          id: true,
          type: true,
          fileUrl: true,
          fileName: true,
          status: true,
          adminNote: true,
          reviewedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // ── Fetch recent transactions ──────────────────────────────
  const accountIds = user.accounts.map((a) => a.id);
  const recentTransactions =
    accountIds.length > 0
      ? await prisma.transaction.findMany({
          where: { accountId: { in: accountIds } },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            reference: true,
            description: true,
            createdAt: true,
            account: {
              select: { accountNumber: true },
            },
          },
        })
      : [];

  // ── Fetch cards ────────────────────────────────────────────
  const cards =
    accountIds.length > 0
      ? await prisma.card.findMany({
          where: { accountId: { in: accountIds } },
          select: {
            id: true,
            type: true,
            lastFour: true,
            expiryDate: true,
            cardholderName: true,
            status: true,
            dailyLimit: true,
            createdAt: true,
            account: {
              select: { accountNumber: true },
            },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

  // ── Computed values ────────────────────────────────────────
  const totalBalance = user.accounts.reduce(
    (sum, acc) => sum + Number(acc.balance),
    0
  );
  const initials = getInitials(user.firstName, user.lastName);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Back link ──────────────────────────────────────────── */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      {/* ── User Profile Header ────────────────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full gold-gradient text-xl font-bold text-navy-950 shrink-0">
            {initials}
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-text-primary">
                {user.firstName} {user.lastName}
              </h2>
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
              <StatusBadge status={user.status} />
            </div>

            <div className="space-y-1.5 mt-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Mail className="h-4 w-4 text-text-muted shrink-0" />
                <span className="truncate">{user.email}</span>
                {user.emailVerified && (
                  <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" />
                )}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <User className="h-4 w-4 text-text-muted shrink-0" />
                  {user.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 text-text-muted shrink-0" />
                Joined {formatDate(user.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Clock className="h-4 w-4 text-text-muted shrink-0" />
                Last login: {user.lastLoginAt ? timeAgo(user.lastLoginAt) : "Never"}
              </div>
            </div>
          </div>

          {/* Balance summary */}
          <div className="sm:text-right shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
              Total Balance
            </p>
            <p className="text-2xl font-bold gold-text">
              {formatCurrency(totalBalance)}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Across {user.accounts.length} {user.accounts.length === 1 ? "account" : "accounts"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Actions Panel ──────────────────────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4">
          Admin Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {/* Status change actions */}
          {user.status !== "ACTIVE" && (
            <form action={`/api/admin/users/${user.id}`} method="POST">
              <input type="hidden" name="status" value="ACTIVE" />
              <button
                type="submit"
                formAction={async () => {
                  "use server";
                  const sessionData = await getSession();
                  if (!sessionData) return;

                  const adminUser = await prisma.user.findUnique({
                    where: { id: sessionData.userId },
                    select: { role: true },
                  });
                  if (!adminUser || adminUser.role !== "ADMIN") return;

                  const target = await prisma.user.findUnique({
                    where: { id },
                    select: { status: true, email: true },
                  });
                  if (!target) return;

                  await prisma.user.update({
                    where: { id },
                    data: { status: "ACTIVE" },
                  });

                  await prisma.auditLog.create({
                    data: {
                      adminId: sessionData.userId,
                      action: "UPDATE_USER_STATUS",
                      targetType: "USER",
                      targetId: id,
                      details: {
                        previousStatus: target.status,
                        newStatus: "ACTIVE",
                        userEmail: target.email,
                      },
                    },
                  });

                  const { redirect: redir } = await import("next/navigation");
                  redir(`/admin/users/${id}`);
                }}
                className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-2.5 text-sm font-medium text-success transition-all hover:bg-success/20"
              >
                <CheckCircle className="h-4 w-4" />
                Activate User
              </button>
            </form>
          )}

          {user.status !== "SUSPENDED" && (
            <form>
              <button
                type="submit"
                formAction={async () => {
                  "use server";
                  const sessionData = await getSession();
                  if (!sessionData) return;

                  const adminUser = await prisma.user.findUnique({
                    where: { id: sessionData.userId },
                    select: { role: true },
                  });
                  if (!adminUser || adminUser.role !== "ADMIN") return;

                  if (id === sessionData.userId) return;

                  const target = await prisma.user.findUnique({
                    where: { id },
                    select: { status: true, email: true },
                  });
                  if (!target) return;

                  await prisma.user.update({
                    where: { id },
                    data: { status: "SUSPENDED" },
                  });

                  await prisma.auditLog.create({
                    data: {
                      adminId: sessionData.userId,
                      action: "UPDATE_USER_STATUS",
                      targetType: "USER",
                      targetId: id,
                      details: {
                        previousStatus: target.status,
                        newStatus: "SUSPENDED",
                        userEmail: target.email,
                      },
                    },
                  });

                  const { redirect: redir } = await import("next/navigation");
                  redir(`/admin/users/${id}`);
                }}
                className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning/20 px-4 py-2.5 text-sm font-medium text-warning transition-all hover:bg-warning/20"
              >
                <Ban className="h-4 w-4" />
                Suspend User
              </button>
            </form>
          )}

          {user.status !== "FROZEN" && (
            <form>
              <button
                type="submit"
                formAction={async () => {
                  "use server";
                  const sessionData = await getSession();
                  if (!sessionData) return;

                  const adminUser = await prisma.user.findUnique({
                    where: { id: sessionData.userId },
                    select: { role: true },
                  });
                  if (!adminUser || adminUser.role !== "ADMIN") return;

                  if (id === sessionData.userId) return;

                  const target = await prisma.user.findUnique({
                    where: { id },
                    select: { status: true, email: true },
                  });
                  if (!target) return;

                  await prisma.user.update({
                    where: { id },
                    data: { status: "FROZEN" },
                  });

                  await prisma.auditLog.create({
                    data: {
                      adminId: sessionData.userId,
                      action: "UPDATE_USER_STATUS",
                      targetType: "USER",
                      targetId: id,
                      details: {
                        previousStatus: target.status,
                        newStatus: "FROZEN",
                        userEmail: target.email,
                      },
                    },
                  });

                  const { redirect: redir } = await import("next/navigation");
                  redir(`/admin/users/${id}`);
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 text-sm font-medium text-blue-400 transition-all hover:bg-blue-500/20"
              >
                <Snowflake className="h-4 w-4" />
                Freeze Account
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Accounts Section ───────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Accounts ({user.accounts.length})
        </h3>
        {user.accounts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl bg-navy-800 border border-border-subtle p-5 transition-all hover:border-gold-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {account.type}
                  </span>
                  <StatusBadge status={account.status} />
                </div>
                <p className="text-lg font-bold text-text-primary mb-1">
                  {formatCurrency(Number(account.balance), account.currency)}
                </p>
                <p className="text-xs text-text-muted">{account.label}</p>
                <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs text-text-muted font-mono">
                    ****{account.accountNumber.slice(-4)}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatDate(account.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-navy-800 border border-border-subtle">
            <EmptyState
              icon={Wallet}
              title="No accounts"
              description="This user does not have any accounts yet."
            />
          </div>
        )}
      </div>

      {/* ── Recent Transactions ─────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Recent Transactions ({recentTransactions.length})
        </h3>
        {recentTransactions.length > 0 ? (
          <div className="rounded-xl bg-navy-800 border border-border-subtle divide-y divide-border-subtle overflow-hidden">
            {/* Desktop table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Reference</div>
              <div className="col-span-2">Account</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1 text-right">Date</div>
            </div>
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="px-4 py-3.5 hover:bg-navy-700/50 transition-colors"
              >
                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        tx.type === "CREDIT" ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      <ArrowLeftRight
                        className={`h-4 w-4 ${
                          tx.type === "CREDIT" ? "text-success" : "text-error"
                        }`}
                      />
                    </div>
                    <span className="text-sm text-text-primary truncate">
                      {tx.description}
                    </span>
                  </div>
                  <div className="col-span-2 text-xs text-text-muted font-mono truncate">
                    {tx.reference}
                  </div>
                  <div className="col-span-2 text-xs text-text-muted font-mono">
                    ****{tx.account.accountNumber.slice(-4)}
                  </div>
                  <div className="col-span-1">
                    <StatusBadge status={tx.status} />
                  </div>
                  <div
                    className={cn(
                      "col-span-2 text-sm font-semibold text-right",
                      tx.type === "CREDIT" ? "text-success" : "text-error"
                    )}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(Number(tx.amount))}
                  </div>
                  <div className="col-span-1 text-xs text-text-muted text-right whitespace-nowrap">
                    {timeAgo(tx.createdAt)}
                  </div>
                </div>

                {/* Mobile */}
                <div className="md:hidden flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                        tx.type === "CREDIT" ? "bg-success/10" : "bg-error/10"
                      }`}
                    >
                      <ArrowLeftRight
                        className={`h-4 w-4 ${
                          tx.type === "CREDIT" ? "text-success" : "text-error"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-text-muted">{timeAgo(tx.createdAt)}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold whitespace-nowrap",
                      tx.type === "CREDIT" ? "text-success" : "text-error"
                    )}
                  >
                    {tx.type === "CREDIT" ? "+" : "-"}
                    {formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-navy-800 border border-border-subtle">
            <EmptyState
              icon={ArrowLeftRight}
              title="No transactions"
              description="This user has no transactions yet."
            />
          </div>
        )}
      </div>

      {/* ── KYC Documents ──────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          KYC Documents ({user.kycDocuments.length})
          <StatusBadge status={user.kycStatus} className="ml-2" />
        </h3>
        {user.kycDocuments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.kycDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-xl bg-navy-800 border border-border-subtle p-5 transition-all hover:border-gold-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                      {doc.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                <p className="text-sm text-text-primary truncate mb-1">
                  {doc.fileName}
                </p>
                {doc.adminNote && (
                  <p className="text-xs text-text-muted mt-2 p-2 rounded-lg bg-navy-700/50 border border-border-subtle">
                    Note: {doc.adminNote}
                  </p>
                )}
                <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    Uploaded {formatDate(doc.createdAt)}
                  </span>
                  {doc.reviewedAt && (
                    <span className="text-xs text-text-muted">
                      Reviewed {formatDate(doc.reviewedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-navy-800 border border-border-subtle">
            <EmptyState
              icon={Shield}
              title="No KYC documents"
              description="This user has not uploaded any KYC documents."
            />
          </div>
        )}
      </div>

      {/* ── Cards Section ──────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Cards ({cards.length})
        </h3>
        {cards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl bg-navy-800 border border-border-subtle p-5 transition-all hover:border-gold-500/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {card.type}
                  </span>
                  <StatusBadge status={card.status} />
                </div>
                <p className="text-lg font-bold text-text-primary font-mono mb-1">
                  **** **** **** {card.lastFour}
                </p>
                <p className="text-xs text-text-secondary">{card.cardholderName}</p>
                <div className="mt-3 pt-3 border-t border-border-subtle grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">
                      Expires
                    </p>
                    <p className="text-xs font-medium text-text-secondary mt-0.5">
                      {card.expiryDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">
                      Limit
                    </p>
                    <p className="text-xs font-medium text-text-secondary mt-0.5">
                      {formatCurrency(Number(card.dailyLimit))}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">
                      Account
                    </p>
                    <p className="text-xs font-medium text-text-muted font-mono mt-0.5">
                      ****{card.account.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-navy-800 border border-border-subtle">
            <EmptyState
              icon={CreditCard}
              title="No cards"
              description="This user does not have any cards issued."
            />
          </div>
        )}
      </div>
    </div>
  );
}
