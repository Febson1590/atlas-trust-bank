"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  X,
  Loader2,
} from "lucide-react";

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

export default function KycActions({ document }: { document: KycDocument }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction(e: React.FormEvent) {
    e.preventDefault();
    if (!action) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
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

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setAction("approve"); setShowModal(true); setError(""); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-medium hover:bg-success/20 transition-colors"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Approve
        </button>
        <button
          onClick={() => { setAction("reject"); setShowModal(true); setError(""); }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-medium hover:bg-error/20 transition-colors"
        >
          <XCircle className="h-3.5 w-3.5" />
          Reject
        </button>
      </div>

      {showModal && action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowModal(false); setAction(null); }} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${action === "approve" ? "text-success" : "text-error"}`}>
                {action === "approve" ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                {action === "approve" ? "Approve Document" : "Reject Document"}
              </h2>
              <button onClick={() => { setShowModal(false); setAction(null); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-navy-900/50 border border-border-default">
              <p className="text-sm text-text-muted">Document</p>
              <p className="text-text-primary text-sm font-medium">{document.type} — {document.fileName}</p>
              <p className="text-text-muted text-xs mt-1">
                {document.user.firstName} {document.user.lastName} ({document.user.email})
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Note {action === "approve" && <span className="text-text-muted">(optional)</span>}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  required={action === "reject"}
                  rows={3}
                  placeholder={action === "reject" ? "Reason for rejection (required)..." : "Add a note (optional)..."}
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
                  className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${
                    action === "approve"
                      ? "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                      : "bg-error/20 text-error border border-error/30 hover:bg-error/30"
                  }`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm {action === "approve" ? "Approval" : "Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
