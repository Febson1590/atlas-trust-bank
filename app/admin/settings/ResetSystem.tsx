"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export default function ResetSystem() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setShowConfirm(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="glass glass-border rounded-xl p-6 border-error/20">
        <h2 className="text-base font-semibold text-error flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4" />
          Danger Zone
        </h2>
        <p className="text-sm text-text-muted mb-4">
          Reset all user data including accounts, transactions, balances, KYC, and cards. Admin accounts are preserved.
        </p>

        {success && (
          <div className="mb-4 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
            System reset complete. All user data has been cleared.
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Reset All Data
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Reset All Data</h3>
              </div>
              <button onClick={() => setShowConfirm(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-2">
              This will permanently delete:
            </p>
            <ul className="text-sm text-text-muted mb-5 space-y-1 list-disc list-inside">
              <li>All user accounts and balances</li>
              <li>All transactions and transfers</li>
              <li>All cards, KYC documents, and notifications</li>
              <li>All support tickets</li>
            </ul>
            <p className="text-xs text-error mb-5">
              User login accounts and admin accounts will be preserved. This cannot be undone.
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-error/10 border border-error/20 px-4 py-2.5 text-sm text-error">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-error/20 text-error border border-error/30 hover:bg-error/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
