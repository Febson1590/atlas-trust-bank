"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Power,
  PowerOff,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface UserActionsProps {
  userId: string;
  userName: string;
  hasAccounts: boolean;
  allAccountsDormant: boolean;
}

export default function UserActions({
  userId,
  userName,
  hasAccounts,
  allAccountsDormant,
}: UserActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"dormant" | "activate" | "delete" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAction() {
    if (!confirmAction) return;
    setLoading(true);
    setError("");

    try {
      if (confirmAction === "delete") {
        const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to delete user"); setLoading(false); return; }
        router.push("/admin/users");
        return;
      }

      // Set dormant or activate accounts
      const newStatus = confirmAction === "dormant" ? "DORMANT" : "ACTIVE";
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Action failed"); setLoading(false); return; }

      setConfirmAction(null);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const actionConfig = {
    dormant: {
      title: "Set Accounts to Dormant",
      desc: `This will mark all of ${userName}'s accounts as dormant. They can still log in but won't be able to send money or make transactions.`,
      btnClass: "bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30",
      btnText: "Set Dormant",
    },
    activate: {
      title: "Activate Accounts",
      desc: `This will reactivate all of ${userName}'s accounts. They will be able to send money and make transactions again.`,
      btnClass: "bg-success/20 text-success border border-success/30 hover:bg-success/30",
      btnText: "Activate",
    },
    delete: {
      title: "Delete User Permanently",
      desc: `This will permanently delete ${userName}'s account and all associated data. This action cannot be undone.`,
      btnClass: "bg-error/20 text-error border border-error/30 hover:bg-error/30",
      btnText: "Delete Permanently",
    },
  };

  return (
    <>
      {/* Dropdown trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 rounded-lg bg-navy-700 border border-border-subtle px-3 py-2 text-sm font-medium text-text-primary hover:border-gold-500/30 transition-all"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="hidden sm:inline">Actions</span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 z-40 w-48 rounded-lg bg-navy-800 border border-border-default shadow-xl overflow-hidden animate-fade-in">
              {hasAccounts && !allAccountsDormant && (
                <button
                  type="button"
                  onClick={() => { setConfirmAction("dormant"); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-warning hover:bg-navy-700 transition-colors"
                >
                  <PowerOff className="h-4 w-4" />
                  Set Dormant
                </button>
              )}
              {hasAccounts && allAccountsDormant && (
                <button
                  type="button"
                  onClick={() => { setConfirmAction("activate"); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-success hover:bg-navy-700 transition-colors"
                >
                  <Power className="h-4 w-4" />
                  Activate Accounts
                </button>
              )}
              <button
                type="button"
                onClick={() => { setConfirmAction("delete"); setMenuOpen(false); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-error hover:bg-navy-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setConfirmAction(null); setError(""); }} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${confirmAction === "delete" ? "text-error" : confirmAction === "dormant" ? "text-warning" : "text-success"}`} />
                <h3 className="text-lg font-semibold text-text-primary">
                  {actionConfig[confirmAction].title}
                </h3>
              </div>
              <button onClick={() => { setConfirmAction(null); setError(""); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-5">
              {actionConfig[confirmAction].desc}
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-error/10 border border-error/20 px-4 py-2.5 text-sm text-error">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setConfirmAction(null); setError(""); }}
                className="flex-1 py-2.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={loading}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${actionConfig[confirmAction].btnClass}`}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {actionConfig[confirmAction].btnText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
