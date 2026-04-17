"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  MessageSquare,
} from "lucide-react";

interface Transfer {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  recipientName: string | null;
}

/**
 * Inline approve / reject / delay UI for a transfer row.
 *
 * Previously this opened a `fixed inset-0` modal — which on iPhone Safari
 * (with the on-screen keyboard + 100dvh quirks + z-index stacking issues)
 * regularly ended up with the Confirm button below the fold and no way
 * to scroll to it. Same class of bug we had on the KYC review page.
 *
 * The fix mirrors what we did for KYC: drop the modal entirely. Clicking
 * Approve / Reject / Delay unfolds a confirmation block in the normal
 * document flow directly below the action row. Users scroll the page
 * naturally to reach the Confirm button — no viewport math, no modal
 * clipping, no keyboard jitter.
 */
export default function TransferActions({ transfer }: { transfer: Transfer }) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | "delay" | null>(
    null
  );
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function cancel() {
    setAction(null);
    setAdminNote("");
    setError("");
  }

  function pick(next: "approve" | "reject" | "delay") {
    setAction(next);
    setAdminNote("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!action) return;
    if (action === "reject" && adminNote.trim().length === 0) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/transfers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId: transfer.id,
          action,
          adminNote: adminNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Action failed");
        return;
      }
      setAction(null);
      setAdminNote("");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const config = {
    approve: {
      icon: CheckCircle,
      label: "Approve this transfer?",
      confirmText: "Confirm Approval",
      noteLabel: "Note",
      noteRequired: false,
      notePlaceholder: "Add a note for the audit log (optional)...",
      panel: "bg-success/5 border-success/20",
      header: "text-success",
      confirmBtn:
        "bg-success/20 text-success border border-success/30 hover:bg-success/30",
    },
    reject: {
      icon: XCircle,
      label: "Reject this transfer?",
      confirmText: "Confirm Rejection",
      noteLabel: "Reason",
      noteRequired: true,
      notePlaceholder: "Tell the customer why this was rejected...",
      panel: "bg-error/5 border-error/20",
      header: "text-error",
      confirmBtn:
        "bg-error/20 text-error border border-error/30 hover:bg-error/30",
    },
    delay: {
      icon: Clock,
      label: "Delay this transfer (mark as processing)?",
      confirmText: "Confirm Delay",
      noteLabel: "Note",
      noteRequired: false,
      notePlaceholder: "Add an internal note (optional)...",
      panel: "bg-warning/5 border-warning/20",
      header: "text-warning",
      confirmBtn:
        "bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30",
    },
  } as const;

  return (
    <div className="w-full">
      {/* Action buttons — full-width stacked on mobile, inline on desktop */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
        <button
          type="button"
          onClick={() => pick("approve")}
          disabled={loading || action !== null}
          aria-pressed={action === "approve"}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${
            action === "approve"
              ? "bg-success/30 text-success border border-success/40"
              : "bg-success/10 text-success border border-success/20 hover:bg-success/20"
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </button>
        <button
          type="button"
          onClick={() => pick("reject")}
          disabled={loading || action !== null}
          aria-pressed={action === "reject"}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${
            action === "reject"
              ? "bg-error/30 text-error border border-error/40"
              : "bg-error/10 text-error border border-error/20 hover:bg-error/20"
          }`}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
        <button
          type="button"
          onClick={() => pick("delay")}
          disabled={loading || action !== null}
          aria-pressed={action === "delay"}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${
            action === "delay"
              ? "bg-warning/30 text-warning border border-warning/40"
              : "bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20"
          }`}
        >
          <Clock className="h-4 w-4" />
          Delay
        </button>
      </div>

      {/* Inline confirmation panel — same pattern as KycActions */}
      {action && (
        <div className={`mt-3 rounded-lg border p-4 ${config[action].panel}`}>
          <div
            className={`flex items-center gap-2 text-sm font-semibold mb-3 ${config[action].header}`}
          >
            {(() => {
              const Icon = config[action].icon;
              return <Icon className="h-4 w-4" />;
            })()}
            {config[action].label}
          </div>

          <div className="mb-3 rounded-lg bg-navy-900/50 border border-border-default p-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Reference</span>
              <span className="text-text-primary font-mono">
                {transfer.reference}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Amount</span>
              <span className="text-text-primary font-semibold">
                {transfer.currency}{" "}
                {transfer.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Recipient</span>
              <span className="text-text-primary">
                {transfer.recipientName || "—"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor={`admin-note-${transfer.id}`}
                className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-1.5"
              >
                <MessageSquare className="h-3 w-3" />
                {config[action].noteLabel}{" "}
                {config[action].noteRequired ? (
                  <span className="text-error">*</span>
                ) : (
                  <span className="text-text-muted">(optional)</span>
                )}
              </label>
              <textarea
                id={`admin-note-${transfer.id}`}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required={config[action].noteRequired}
                rows={3}
                placeholder={config[action].notePlaceholder}
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 resize-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error">
                {error}
              </div>
            )}

            {/* Confirm / Cancel — stacked full-width on mobile, primary
                first (confirm) so it's the most prominent button */}
            <div className="flex flex-col sm:flex-row-reverse gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 ${config[action].confirmBtn}`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {config[action].confirmText}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={loading}
                className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center rounded-lg px-4 py-3 sm:py-2.5 text-sm font-medium border border-border-default text-text-secondary hover:bg-navy-800/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
