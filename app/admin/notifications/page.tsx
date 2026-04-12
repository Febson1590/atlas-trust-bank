import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Bell, Send } from "lucide-react";
import NotificationForm from "./NotificationForm";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const [users, recentNotifications] = await Promise.all([
    prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true, firstName: true, lastName: true, email: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.notification.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    }),
  ]);

  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
  }));

  const serializedNotifications = recentNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    user: {
      name: `${n.user.firstName} ${n.user.lastName}`,
      email: n.user.email,
    },
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <Bell className="h-5 w-5 text-navy-950" />
          </div>
          Notifications
        </h1>
        <p className="text-text-muted mt-1">Send notifications to users or broadcast to all</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Form */}
        <NotificationForm users={serializedUsers} />

        {/* Recent Notifications */}
        <div className="glass glass-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border-default">
            <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <Send className="h-4 w-4 text-gold-500" />
              Recent Notifications
            </h2>
          </div>

          {serializedNotifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-text-muted text-sm">No notifications sent yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border-default max-h-[600px] overflow-y-auto">
              {serializedNotifications.map((notif) => (
                <div key={notif.id} className="px-6 py-4 hover:bg-navy-800/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary text-sm font-medium truncate">{notif.title}</p>
                      <p className="text-text-muted text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-text-muted">{notif.user.name}</span>
                        <span className="text-text-muted">·</span>
                        <span className="text-xs text-text-muted">{formatDate(notif.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        notif.type === "SYSTEM" ? "bg-navy-800 text-text-muted" :
                        notif.type === "SECURITY" ? "bg-error/15 text-error" :
                        notif.type === "KYC" ? "bg-blue-500/15 text-blue-400" :
                        notif.type === "TRANSFER" ? "bg-success/15 text-success" :
                        "bg-warning/15 text-warning"
                      }`}>
                        {notif.type}
                      </span>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-gold-500" title="Unread" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
