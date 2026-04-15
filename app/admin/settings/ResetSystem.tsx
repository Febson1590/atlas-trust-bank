"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

// Typed confirmation phrase. User must type this exactly (case-sensitive)
// before the Reset button is enabled. Stops stray clicks from wiping the
// entire demo database during a client presentation.
const CONFIRM_PHRASE = "RESET ATLAS TRUST BANK";

export default function ResetSystem() {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canSubmit = confirmInput === CONFIRM_PHRASE && !loading;

  function openConfirm() {
    setShowConfirm(true);
    setConfirmInput("");
    setError("");
  }

  function closeConfirm() {
    setShowConfirm(false);
    setConfirmInput("");
    setError("");
  }

  async function handleReset() {
    if (confirmInput !== CONFIRM_PHRASE) {
      setError(`Type "${CONFIRM_PHRASE}" exactly to confirm`);
      return;
    }
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
      setConfirmInput("");
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
          Delete all users and data from the system. Only admin accounts are preserved.
        </p>

        {success && (
          <div className="mb-4 rounded-lg bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
            System reset complete. All users and data have been deleted.
          </div>
        )}

        <button
          type="button"
          onClick={openConfirm}
          className="inline-flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-4 py-2.5 text-sm font-medium text-error hover:bg-error/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Reset All Data
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeConfirm} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Reset All Data</h3>
              </div>
              <button onClick={closeConfirm} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-2">
              This will permanently delete:
            </p>
            <ul className="text-sm text-text-muted mb-5 space-y-1 list-disc list-inside">
              <li>All non-admin users</li>
              <li>All accounts, transactions, and transfers</li>
              <li>All cards, KYC documents, and notifications</li>
              <li>All support tickets and audit logs</li>
            </ul>
            <p className="text-xs text-error mb-4">
              Only admin accounts will be preserved. This cannot be undone.
            </p>

            {/* Typed confirmation — prevents stray clicks from nuking the demo database */}
            <div className="mb-5">
              <label
                htmlFor="reset-confirm"
                className="block text-xs font-medium text-text-secondary mb-2"
              >
                To confirm, type{" "}
                <span className="font-mono text-error">{CONFIRM_PHRASE}</span>
              </label>
              <input
                id="reset-confirm"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className="w-full rounded-lg border border-error/30 bg-navy-900 px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted/40 focus:border-error focus:outline-none focus:ring-1 focus:ring-error/50 transition-colors"
                aria-describedby="reset-confirm-hint"
              />
              <p id="reset-confirm-hint" className="mt-1.5 text-xs text-text-muted">
                Case-sensitive. Must match exactly.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-error/10 border border-error/20 px-4 py-2.5 text-sm text-error">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="flex-1 py-2.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={!canSubmit}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-error/20 text-error border border-error/30 hover:bg-error/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
