"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ArrowLeftRight,
  Shield,
  ShieldCheck,
  Wallet,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { NotificationType } from "@/generated/prisma";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  iconName: string;
}

interface NotificationListProps {
  notifications: Notification[];
  unreadCount: number;
}

const iconComponents: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Shield,
  ShieldCheck,
  Bell,
  Wallet,
};

const typeColors: Record<NotificationType, { bg: string; text: string }> = {
  TRANSFER: { bg: "bg-blue-500/10", text: "text-blue-400" },
  SECURITY: { bg: "bg-error/10", text: "text-error" },
  KYC: { bg: "bg-success/10", text: "text-success" },
  SYSTEM: { bg: "bg-gold-500/10", text: "text-gold-500" },
  ACCOUNT: { bg: "bg-purple-500/10", text: "text-purple-400" },
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  async function markAsRead(id: string) {
    setMarkingId(id);
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    } finally {
      setMarkingId(null);
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-2 rounded-lg bg-navy-700/60 border border-border-subtle px-4 py-2 text-xs font-medium text-text-secondary hover:text-gold-500 hover:border-gold-500/30 transition-all disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Mark all as read
          </button>
        </div>
      )}

      {/* Notification items */}
      <div className="rounded-xl bg-navy-800 border border-border-subtle divide-y divide-border-subtle/50 overflow-hidden">
        {notifications.map((notification) => {
          const Icon = iconComponents[notification.iconName] || Bell;
          const colors = typeColors[notification.type] || typeColors.SYSTEM;

          return (
            <button
              key={notification.id}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id);
                }
              }}
              disabled={notification.read || markingId === notification.id}
              className={cn(
                "w-full flex items-start gap-4 p-4 text-left transition-all hover:bg-navy-700/30",
                !notification.read && "bg-navy-700/10 cursor-pointer",
                notification.read && "cursor-default"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  colors.bg
                )}
              >
                <Icon className={cn("h-5 w-5", colors.text)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        notification.read
                          ? "text-text-secondary"
                          : "text-text-primary"
                      )}
                    >
                      {notification.title}
                    </p>
                    {!notification.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                    )}
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap shrink-0">
                    {timeAgo(notification.createdAt)}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-xs mt-0.5 line-clamp-2",
                    notification.read ? "text-text-muted" : "text-text-secondary"
                  )}
                >
                  {notification.message}
                </p>
              </div>

              {/* Loading indicator */}
              {markingId === notification.id && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gold-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
