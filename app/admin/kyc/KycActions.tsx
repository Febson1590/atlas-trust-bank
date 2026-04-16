"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface KycDocument {
  id: string;
  type: string;
  fileName: string;
  status: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Inline approve/reject UI for a KYC document row.
 *
 * This component used to open a `fixed inset-0` modal. On iPhone Safari —
 * especially with the on-screen keyboard up, viewport meta + `100dvh`
 * edge cases, and every other known iOS `fixed`-positioning footgun —
 * the Confirm button frequently ended up below the fold with no way to
 * scroll inside the modal to reach it.
 *
 * The rewrite ditches the modal entirely. Clicking Approve / Reject
 * unfolds a confirmation block directly below the button row, inside the
 * normal document flow. The user just scrolls the page to see the
 * Confirm button if the keyboard pushes it down — no viewport math,
 * no z-index stacking, no transformed-ancestor clipping, no keyboard
 * jitter. Full-width stacked buttons on mobile, side-by-side on desktop.
 */
export default function KycActions({ document }: { document: KycDocument }) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function cancel() {
    setAction(null);
    setAdminNote("");
    setError("");
  }

  function pick(next: "approve" | "reject") {
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
      const res = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          action,
          adminNote: adminNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Action failed");
        return;
      }
      // Success — collapse the form and refresh the page so the doc
      // updates to its new status.
      setAction(null);
      setAdminNote("");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* Action buttons row — full-width stacked on mobile, inline on desktop */}
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
      </div>

      {/* Inline confirmation panel — renders in normal document flow
          directly below the action row. No fixed positioning, no z-index,
          no viewport math. Always reachable by scrolling.
          No `animate-fade-in` on purpose: the parent user card has
          `overflow-hidden` to clip its rounded corners, and the fade-in
          keyframe briefly uses translateY(16px) which would get clipped
          at animation start. Instant render is cleaner anyway. */}
      {action && (
        <div
          className={`mt-3 rounded-lg border p-4 ${
            action === "approve"
              ? "bg-success/5 border-success/20"
              : "bg-error/5 border-error/20"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm font-semibold mb-3 ${
              action === "approve" ? "text-success" : "text-error"
            }`}
          >
            {action === "approve" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {action === "approve" ? "Approve this document?" : "Reject this document?"}
          </div>

          <p className="text-xs text-text-muted mb-3 break-words">
            {document.user.firstName} {document.user.lastName} — {document.type}
            <br />
            <span className="text-text-muted/70">{document.fileName}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor={`admin-note-${document.id}`}
                className="block text-xs font-medium text-text-secondary mb-1.5"
              >
                {action === "approve" ? (
                  <>
                    Note <span className="text-text-muted">(optional)</span>
                  </>
                ) : (
                  <>
                    Reason <span className="text-error">*</span>
                  </>
                )}
              </label>
              <textarea
                id={`admin-note-${document.id}`}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                required={action === "reject"}
                rows={3}
                placeholder={
                  action === "approve"
                    ? "Add a note for the audit log (optional)..."
                    : "Tell the customer why this was rejected..."
                }
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 resize-none"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error">
                {error}
              </div>
            )}

            {/* Confirm / Cancel — stacked full-width on mobile, side-by-side
                on desktop. In the stacked layout the PRIMARY confirm button
                comes first so it's always the most prominent control. */}
            <div className="flex flex-col sm:flex-row-reverse gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 ${
                  action === "approve"
                    ? "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                    : "bg-error/20 text-error border border-error/30 hover:bg-error/30"
                }`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm {action === "approve" ? "Approval" : "Rejection"}
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
