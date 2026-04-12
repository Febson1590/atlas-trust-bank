import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Headphones, MessageSquare } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import SupportActions from "./SupportActions";

export const dynamic = "force-dynamic";

const STATUS_TABS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-navy-800 text-text-muted",
  medium: "bg-warning/15 text-warning",
  high: "bg-error/15 text-error",
};

interface PageProps {
  searchParams: Promise<{ page?: string; status?: string; ticket?: string }>;
}

export default async function AdminSupportPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const statusFilter = params.status || "ALL";
  const selectedTicketId = params.ticket || "";
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = statusFilter !== "ALL"
    ? { status: statusFilter as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" }
    : {};

  const [tickets, total, statusCounts, selectedTicket] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    }),
    prisma.supportTicket.count({ where }),
    Promise.all(
      STATUS_TABS.filter((s) => s !== "ALL").map(async (s) => ({
        status: s,
        count: await prisma.supportTicket.count({ where: { status: s as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" } }),
      }))
    ),
    selectedTicketId
      ? prisma.supportTicket.findUnique({
          where: { id: selectedTicketId },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            messages: {
              orderBy: { createdAt: "asc" },
              include: {
                sender: {
                  select: { firstName: true, lastName: true, role: true },
                },
              },
            },
          },
        })
      : null,
  ]);

  const totalAll = statusCounts.reduce((sum, s) => sum + s.count, 0);
  const totalPages = Math.ceil(total / limit);

  const serializedTickets = tickets.map((t) => ({
    id: t.id,
    subject: t.subject,
    message: t.message,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    user: t.user,
    messageCount: t._count.messages,
  }));

  const serializedConversation = selectedTicket
    ? {
        id: selectedTicket.id,
        subject: selectedTicket.subject,
        status: selectedTicket.status,
        priority: selectedTicket.priority,
        user: selectedTicket.user,
        messages: selectedTicket.messages.map((m) => ({
          id: m.id,
          message: m.message,
          senderRole: m.senderRole,
          senderName: `${m.sender.firstName} ${m.sender.lastName}`,
          createdAt: m.createdAt.toISOString(),
        })),
      }
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
            <Headphones className="h-5 w-5 text-navy-950" />
          </div>
          Support Tickets
        </h1>
        <p className="text-text-muted mt-1">{total} ticket{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count = tab === "ALL" ? totalAll : statusCounts.find((s) => s.status === tab)?.count || 0;
          const isActive = statusFilter === tab;
          return (
            <a
              key={tab}
              href={`/admin/support${tab !== "ALL" ? `?status=${tab}` : ""}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "gold-gradient text-navy-950"
                  : "glass glass-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab === "IN_PROGRESS" ? "In Progress" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-navy-950/20 text-navy-950" : "bg-navy-800 text-text-muted"
              }`}>
                {count}
              </span>
            </a>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2">
          {serializedTickets.length === 0 ? (
            <div className="glass glass-border rounded-xl">
              <EmptyState
                icon={MessageSquare}
                title="No tickets"
                description={statusFilter !== "ALL" ? `No ${statusFilter.toLowerCase().replace("_", " ")} tickets.` : "No support tickets yet."}
              />
            </div>
          ) : (
            <div className="glass glass-border rounded-xl overflow-hidden divide-y divide-border-default">
              {serializedTickets.map((ticket) => (
                <a
                  key={ticket.id}
                  href={`/admin/support?ticket=${ticket.id}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                  className={`block px-5 py-4 hover:bg-navy-800/30 transition-colors ${
                    selectedTicketId === ticket.id ? "bg-navy-800/40 border-l-2 border-l-gold-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-text-primary text-sm font-medium truncate flex-1">
                      {ticket.subject}
                    </h3>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-text-muted text-xs">
                      {ticket.user.firstName} {ticket.user.lastName}
                    </span>
                    <span className="text-text-muted text-xs">·</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className="text-text-muted text-xs">·</span>
                    <span className="text-text-muted text-xs flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {ticket.messageCount}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-1">
                    Updated {formatDate(ticket.updatedAt)}
                  </p>
                </a>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-border-default">
                  <span className="text-xs text-text-muted">{skip + 1}–{Math.min(skip + limit, total)} of {total}</span>
                  <div className="flex gap-1">
                    {page > 1 && (
                      <a
                        href={`/admin/support?page=${page - 1}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                        className="px-2 py-1 text-xs border border-border-default rounded text-text-secondary hover:bg-navy-800/50"
                      >
                        Prev
                      </a>
                    )}
                    {page < totalPages && (
                      <a
                        href={`/admin/support?page=${page + 1}${statusFilter !== "ALL" ? `&status=${statusFilter}` : ""}`}
                        className="px-2 py-1 text-xs border border-border-default rounded text-text-secondary hover:bg-navy-800/50"
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

        {/* Conversation View */}
        <div className="lg:col-span-3">
          {serializedConversation ? (
            <div className="glass glass-border rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: "700px" }}>
              {/* Ticket Header */}
              <div className="px-6 py-4 border-b border-border-default flex-shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-text-primary font-semibold">{serializedConversation.subject}</h2>
                    <p className="text-text-muted text-xs mt-1">
                      {serializedConversation.user.firstName} {serializedConversation.user.lastName} ({serializedConversation.user.email})
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      PRIORITY_STYLES[serializedConversation.priority] || PRIORITY_STYLES.medium
                    }`}>
                      {serializedConversation.priority}
                    </span>
                    <StatusBadge status={serializedConversation.status} />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {serializedConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderRole === "ADMIN" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.senderRole === "ADMIN"
                        ? "bg-gold-500/10 border border-gold-500/20"
                        : "bg-navy-800/50 border border-border-default"
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${
                          msg.senderRole === "ADMIN" ? "gold-text" : "text-text-secondary"
                        }`}>
                          {msg.senderName}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          msg.senderRole === "ADMIN"
                            ? "bg-gold-500/20 text-gold-500"
                            : "bg-navy-700 text-text-muted"
                        }`}>
                          {msg.senderRole}
                        </span>
                      </div>
                      <p className="text-text-primary text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-text-muted text-xs mt-1.5">{formatDate(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply + Status Controls */}
              <SupportActions ticket={serializedConversation} />
            </div>
          ) : (
            <div className="glass glass-border rounded-xl flex items-center justify-center py-24">
              <div className="text-center">
                <MessageSquare className="h-10 w-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted text-sm">Select a ticket to view the conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
