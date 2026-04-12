import { redirect } from "next/navigation";
import {
  Bell,
  ArrowLeftRight,
  Shield,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import type { NotificationType } from "@/app/generated/prisma/client";
import type { Metadata } from "next";
import NotificationList from "./NotificationList";

export const metadata: Metadata = {
  title: "Notifications",
};

const iconMap: Record<NotificationType, string> = {
  TRANSFER: "ArrowLeftRight",
  SECURITY: "Shield",
  KYC: "ShieldCheck",
  SYSTEM: "Bell",
  ACCOUNT: "Wallet",
};

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  // ── Session ────────────────────────────────────────────────
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const filter = params.filter || "all";

  // ── Fetch notifications ────────────────────────────────────
  const where: Record<string, unknown> = {
    userId: session.userId,
  };

  if (filter === "unread") {
    where.read = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.userId, read: false },
  });

  const serialized = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type as NotificationType,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    iconName: iconMap[n.type as NotificationType] || "Bell",
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Notifications
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Stay updated on your account activity
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/15 border border-gold-500/20 px-3 py-1 text-xs font-medium text-gold-500 self-start sm:self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-pulse" />
            {unreadCount} unread
          </span>
        )}
      </div>

      {/* ── Filter Tabs + Mark All Read ─────────────────────── */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href="/dashboard/notifications"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                filter === "all"
                  ? "bg-gold-500/15 text-gold-500 border-gold-500/30"
                  : "bg-navy-900 text-text-muted border-border-subtle hover:border-gold-500/30 hover:text-text-secondary"
              )}
            >
              All
            </a>
            <a
              href="/dashboard/notifications?filter=unread"
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                filter === "unread"
                  ? "bg-gold-500/15 text-gold-500 border-gold-500/30"
                  : "bg-navy-900 text-text-muted border-border-subtle hover:border-gold-500/30 hover:text-text-secondary"
              )}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </a>
          </div>
        </div>
      </div>

      {/* ── Notifications List ──────────────────────────────── */}
      {serialized.length > 0 ? (
        <NotificationList
          notifications={serialized}
          unreadCount={unreadCount}
        />
      ) : (
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={Bell}
            title={
              filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"
            }
            description={
              filter === "unread"
                ? "You're all caught up! All your notifications have been read."
                : "You'll receive notifications about transfers, security alerts, and account updates here."
            }
            action={
              filter === "unread"
                ? { label: "View All", href: "/dashboard/notifications" }
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
