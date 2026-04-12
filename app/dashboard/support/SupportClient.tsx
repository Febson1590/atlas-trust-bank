"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MessageSquare,
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface SelectedTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface SupportClientProps {
  tickets: Ticket[];
  selectedTicket: SelectedTicket | null;
  userName: string;
}

const priorityColors: Record<string, string> = {
  low: "text-text-muted",
  medium: "text-warning",
  high: "text-error",
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

function formatMessageTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportClient({
  tickets,
  selectedTicket,
  userName,
}: SupportClientProps) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages?.length]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create ticket");
        return;
      }

      setSuccess("Ticket created successfully");
      setNewTicket({ subject: "", message: "", priority: "medium" });
      setShowNewForm(false);
      router.refresh();
      // Navigate to the newly created ticket
      router.push(`/dashboard/support?ticket=${data.data.id}`);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTicket || !reply.trim()) return;

    setError("");
    setSendingReply(true);

    try {
      const res = await fetch(`/api/support/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reply");
        return;
      }

      setReply("");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSendingReply(false);
    }
  }

  // ── Viewing a specific ticket ──────────────────────────────
  if (selectedTicket) {
    return (
      <div className="space-y-4">
        {/* Back + ticket header */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <div className="flex items-center gap-3 mb-3">
            <a
              href="/dashboard/support"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700/60 border border-border-subtle text-text-muted hover:text-text-primary hover:border-gold-500/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </a>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary truncate">
                {selectedTicket.subject}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={selectedTicket.status} />
                <span
                  className={cn(
                    "text-xs font-medium capitalize",
                    priorityColors[selectedTicket.priority]
                  )}
                >
                  {selectedTicket.priority} priority
                </span>
                <span className="text-xs text-text-muted">
                  &middot; {timeAgo(selectedTicket.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
            {selectedTicket.messages.map((msg) => {
              const isUser = msg.senderRole === "USER";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Admin avatar */}
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 border border-blue-500/20">
                      <LifeBuoy className="h-4 w-4 text-blue-400" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[75%] sm:max-w-[65%]",
                      isUser ? "order-first" : ""
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5",
                        isUser
                          ? "bg-gold-500/15 border border-gold-500/20 rounded-br-md"
                          : "bg-navy-700/60 border border-border-subtle rounded-bl-md"
                      )}
                    >
                      <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 mt-1 px-1",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      <span className="text-[10px] text-text-muted">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        &middot;
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* User avatar */}
                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15 border border-gold-500/20">
                      <span className="text-xs font-semibold text-gold-500">
                        {userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply form */}
          {selectedTicket.status !== "CLOSED" ? (
            <form
              onSubmit={handleSendReply}
              className="border-t border-border-subtle p-4"
            >
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2 mb-3">
                  <AlertCircle className="h-3.5 w-3.5 text-error shrink-0" />
                  <p className="text-xs text-error">{error}</p>
                </div>
              )}
              <div className="flex items-end gap-3">
                <textarea
                  value={reply}
                  onChange={(e) => {
                    setReply(e.target.value);
                    setError("");
                  }}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 rounded-lg bg-navy-900 border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all resize-none"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !reply.trim()}
                  className="gold-gradient rounded-lg p-2.5 text-navy-950 transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
                >
                  {sendingReply ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t border-border-subtle px-4 py-3 text-center">
              <p className="text-xs text-text-muted">
                This ticket is closed. Create a new ticket if you need further
                assistance.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── New Ticket Form ────────────────────────────────────────
  if (showNewForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowNewForm(false);
              setError("");
              setSuccess("");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-700/60 border border-border-subtle text-text-muted hover:text-text-primary hover:border-gold-500/30 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h3 className="text-lg font-semibold text-text-primary">
            Create New Ticket
          </h3>
        </div>

        <form onSubmit={handleCreateTicket}>
          <div className="rounded-xl bg-navy-800 border border-border-subtle overflow-hidden">
            <div className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-error shrink-0" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/20 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  <p className="text-sm text-success">{success}</p>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Brief description of your issue"
                  required
                  minLength={5}
                  className="w-full rounded-lg bg-navy-900 border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Priority
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) =>
                    setNewTicket((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg bg-navy-900 border border-border-subtle px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Needs attention</option>
                  <option value="high">High - Urgent issue</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Message
                </label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) =>
                    setNewTicket((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Describe your issue in detail..."
                  required
                  minLength={10}
                  rows={5}
                  className="w-full rounded-lg bg-navy-900 border border-border-subtle px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="gold-gradient rounded-lg px-6 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Submit Ticket
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // ── Ticket List ─────────────────────────────────────��──────
  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            Total
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {tickets.length}
          </p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            Open
          </p>
          <p className="text-2xl font-bold text-warning">
            {tickets.filter((t) => t.status === "OPEN").length}
          </p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            In Progress
          </p>
          <p className="text-2xl font-bold text-blue-400">
            {tickets.filter((t) => t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="rounded-xl bg-navy-800 border border-border-subtle p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            Resolved
          </p>
          <p className="text-2xl font-bold text-success">
            {
              tickets.filter(
                (t) => t.status === "RESOLVED" || t.status === "CLOSED"
              ).length
            }
          </p>
        </div>
      </div>

      {/* New Ticket Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowNewForm(true)}
          className="gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 transition-all hover:opacity-90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* Ticket list */}
      {tickets.length > 0 ? (
        <div className="rounded-xl bg-navy-800 border border-border-subtle divide-y divide-border-subtle/50 overflow-hidden">
          {tickets.map((ticket) => (
            <a
              key={ticket.id}
              href={`/dashboard/support?ticket=${ticket.id}`}
              className="flex items-center gap-4 p-4 hover:bg-navy-700/30 transition-all group"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-700/60 border border-border-subtle group-hover:border-gold-500/30 transition-all">
                <MessageSquare className="h-5 w-5 text-text-muted group-hover:text-gold-500 transition-colors" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-text-primary truncate group-hover:text-gold-500 transition-colors">
                    {ticket.subject}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={ticket.status} />
                  <span
                    className={cn(
                      "text-xs font-medium capitalize",
                      priorityColors[ticket.priority]
                    )}
                  >
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-text-muted">
                    &middot; {ticket.messageCount}{" "}
                    {ticket.messageCount === 1 ? "message" : "messages"}
                  </span>
                  <span className="text-xs text-text-muted">
                    &middot; <Clock className="inline h-3 w-3 mr-0.5" />
                    {timeAgo(ticket.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-text-muted shrink-0 group-hover:text-gold-500 transition-colors" />
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-navy-800 border border-border-subtle">
          <EmptyState
            icon={LifeBuoy}
            title="No support tickets"
            description="Need help? Create a support ticket and our team will assist you as soon as possible."
          />
        </div>
      )}
    </div>
  );
}
