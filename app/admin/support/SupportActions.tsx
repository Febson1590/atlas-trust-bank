"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Clock, CheckCircle, XCircle, Archive } from "lucide-react";

interface Ticket {
  id: string;
  status: string;
  subject: string;
}

export default function SupportActions({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          message: reply,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to send reply");
        return;
      }
      setReply("");
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: ticket.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to update status");
        return;
      }
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setStatusLoading(false);
    }
  }

  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="border-t border-border-default flex-shrink-0">
      {error && (
        <div className="px-6 pt-3">
          <div className="p-2.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
            {error}
          </div>
        </div>
      )}

      {/* Status Buttons */}
      <div className="px-6 py-3 flex items-center gap-2 border-b border-border-default flex-wrap">
        <span className="text-xs text-text-muted mr-1">Set status:</span>
        {ticket.status !== "IN_PROGRESS" && !isClosed && (
          <button
            onClick={() => handleStatusChange("IN_PROGRESS")}
            disabled={statusLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors disabled:opacity-50"
          >
            <Clock className="h-3 w-3" />
            In Progress
          </button>
        )}
        {ticket.status !== "RESOLVED" && !isClosed && (
          <button
            onClick={() => handleStatusChange("RESOLVED")}
            disabled={statusLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="h-3 w-3" />
            Resolved
          </button>
        )}
        {ticket.status !== "CLOSED" && (
          <button
            onClick={() => handleStatusChange("CLOSED")}
            disabled={statusLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-navy-800 text-text-muted border border-border-default hover:bg-navy-700 transition-colors disabled:opacity-50"
          >
            <Archive className="h-3 w-3" />
            Close
          </button>
        )}
        {isClosed && (
          <button
            onClick={() => handleStatusChange("OPEN")}
            disabled={statusLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors disabled:opacity-50"
          >
            <XCircle className="h-3 w-3" />
            Reopen
          </button>
        )}
        {statusLoading && <Loader2 className="h-3 w-3 animate-spin text-text-muted" />}
      </div>

      {/* Reply Form */}
      {!isClosed && (
        <form onSubmit={handleReply} className="px-6 py-3 flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={2}
              className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !reply.trim()}
            className="gold-gradient rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Reply
          </button>
        </form>
      )}

      {isClosed && (
        <div className="px-6 py-4 text-center">
          <p className="text-text-muted text-xs">This ticket is closed. Reopen it to send a reply.</p>
        </div>
      )}
    </div>
  );
}
