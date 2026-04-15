import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import ResetSystem from "./ResetSystem";
import {
  Settings,
  User,
  Mail,
  Shield,
  Calendar,
  Database,
  Users,
  Landmark,
  ArrowLeftRight,
  CreditCard,
  FileText,
  ScrollText,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!admin) redirect("/login");

  // Fetch system stats for display
  const [
    userCount,
    accountCount,
    transferCount,
    cardCount,
    kycDocCount,
    auditLogCount,
    ticketCount,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.account.count(),
    prisma.transfer.count(),
    prisma.card.count(),
    prisma.kycDocument.count(),
    prisma.auditLog.count(),
    prisma.supportTicket.count(),
  ]);

  const stats = [
    { label: "Total Users", value: userCount, icon: Users, color: "text-blue-400" },
    { label: "Accounts", value: accountCount, icon: Landmark, color: "text-success" },
    { label: "Transfers", value: transferCount, icon: ArrowLeftRight, color: "text-warning" },
    { label: "Cards Issued", value: cardCount, icon: CreditCard, color: "text-purple-400" },
    { label: "KYC Documents", value: kycDocCount, icon: FileText, color: "text-cyan-400" },
    { label: "Audit Logs", value: auditLogCount, icon: ScrollText, color: "text-orange-400" },
    { label: "Support Tickets", value: ticketCount, icon: FileText, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <Settings className="h-5 w-5 text-navy-950" />
          </div>
          Admin Settings
        </h1>
        <p className="text-text-muted mt-1">System information and admin profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile */}
        <div className="glass glass-border rounded-xl p-6 card-shine">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-6">
            <User className="h-4 w-4 text-gold-500" />
            Admin Profile
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gold-gradient gold-glow">
              <span className="text-xl font-bold text-navy-950">
                {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="text-text-primary text-lg font-semibold">
                {admin.firstName} {admin.lastName}
              </p>
              <p className="text-text-muted text-sm">{admin.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border-default">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <span className="text-text-primary text-sm">{admin.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border-default">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Shield className="h-4 w-4" />
                Role
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500/15 text-gold-500 text-xs font-medium border border-gold-500/20">
                {admin.role}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border-default">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Calendar className="h-4 w-4" />
                Account Created
              </div>
              <span className="text-text-primary text-sm">{formatDate(admin.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Calendar className="h-4 w-4" />
                Last Login
              </div>
              <span className="text-text-primary text-sm">
                {admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="glass glass-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-6">
            <Database className="h-4 w-4 text-gold-500" />
            System Overview
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-navy-900/50 border border-border-default rounded-xl p-4 hover:bg-navy-800/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-text-muted text-xs">{stat.label}</span>
                </div>
                <p className="text-text-primary text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Environment Info */}
          <div className="mt-6 pt-6 border-t border-border-default">
            <h3 className="text-sm font-medium text-text-muted mb-3">Environment</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Platform</span>
                <span className="text-text-secondary">Next.js App Router</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Database</span>
                <span className="text-text-secondary">PostgreSQL (Prisma)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Cache</span>
                <span className="text-text-secondary">Redis</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Email Provider</span>
                <span className="text-text-secondary">Resend</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Runtime</span>
                <span className="text-text-secondary">Node.js {typeof process !== "undefined" ? process.version : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reset System */}
      <ResetSystem />
    </div>
  );
}
