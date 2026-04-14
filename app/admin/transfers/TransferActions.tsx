"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  X,
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

export default function TransferActions({ transfer }: { transfer: Transfer }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | "delay" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(e: React.FormEvent) {
    e.preventDefault();
    if (!action) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/transfers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferId: transfer.id,
          action,
          adminNote: adminNote || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Action failed");
        return;
      }
      setShowModal(false);
      setAdminNote("");
      setAction(null);
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function openModal(a: "approve" | "reject" | "delay") {
    setAction(a);
    setShowModal(true);
    setError("");
    setAdminNote("");
  }

  const actionConfig = {
    approve: {
      label: "Approve Transfer",
      icon: CheckCircle,
      color: "text-success",
      btnClass: "bg-success/20 text-success border border-success/30 hover:bg-success/30",
    },
    reject: {
      label: "Reject Transfer",
      icon: XCircle,
      color: "text-error",
      btnClass: "bg-error/20 text-error border border-error/30 hover:bg-error/30",
    },
    delay: {
      label: "Delay Transfer",
      icon: Clock,
      color: "text-warning",
      btnClass: "bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30",
    },
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={() => openModal("approve")}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-medium hover:bg-success/20 transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Approve</span>
        </button>
        <button
          onClick={() => openModal("reject")}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium hover:bg-error/20 transition-colors"
        >
          <XCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reject</span>
        </button>
        <button
          onClick={() => openModal("delay")}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-warning text-xs font-medium hover:bg-warning/20 transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delay</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowModal(false); setAction(null); }} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${actionConfig[action].color}`}>
                {(() => { const Icon = actionConfig[action].icon; return <Icon className="h-5 w-5" />; })()}
                {actionConfig[action].label}
              </h2>
              <button onClick={() => { setShowModal(false); setAction(null); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-navy-900/50 border border-border-default">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Reference</span>
                <span className="text-text-primary font-mono text-xs">{transfer.reference}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-muted">Amount</span>
                <span className="text-text-primary font-semibold">
                  {transfer.currency} {transfer.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Recipient</span>
                <span className="text-text-primary">{transfer.recipientName || "—"}</span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary mb-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Admin Note {action !== "reject" && <span className="text-text-muted">(optional)</span>}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  required={action === "reject"}
                  rows={3}
                  placeholder={
                    action === "reject"
                      ? "Reason for rejection (required)..."
                      : "Add a note (optional)..."
                  }
                  className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setAction(null); }}
                  className="flex-1 py-2.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${actionConfig[action].btnClass}`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
