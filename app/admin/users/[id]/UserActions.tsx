"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Power,
  PowerOff,
  Trash2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface UserActionsProps {
  userId: string;
  userName: string;
  hasAccounts: boolean;
  allAccountsDormant: boolean;
}

/**
 * Admin actions for a single user: set accounts dormant, reactivate them,
 * or delete the user entirely.
 *
 * Previously this used a `fixed inset-0` confirmation modal. Same mobile
 * bug we hit on the KYC + Transfers pages — on iPhone Safari the Confirm
 * button could end up below the fold with no way to scroll to it.
 *
 * Rewritten to unfold the confirmation panel inline directly below the
 * actions button. Normal document flow, no viewport math, always reachable.
 */
export default function UserActions({
  userId,
  userName,
  hasAccounts,
  allAccountsDormant,
}: UserActionsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "dormant" | "activate" | "delete" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function cancel() {
    setConfirmAction(null);
    setError("");
  }

  function pick(next: "dormant" | "activate" | "delete") {
    setConfirmAction(next);
    setMenuOpen(false);
    setError("");
  }

  async function handleAction() {
    if (!confirmAction) return;
    setLoading(true);
    setError("");

    try {
      if (confirmAction === "delete") {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to delete user");
          setLoading(false);
          return;
        }
        router.push("/admin/users");
        return;
      }

      const newStatus = confirmAction === "dormant" ? "DORMANT" : "ACTIVE";
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Action failed");
        setLoading(false);
        return;
      }

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
      icon: PowerOff,
      panel: "bg-warning/5 border-warning/20",
      header: "text-warning",
      btnClass:
        "bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30",
      btnText: "Set Dormant",
    },
    activate: {
      title: "Activate Accounts",
      desc: `This will reactivate all of ${userName}'s accounts. They will be able to send money and make transactions again.`,
      icon: Power,
      panel: "bg-success/5 border-success/20",
      header: "text-success",
      btnClass:
        "bg-success/20 text-success border border-success/30 hover:bg-success/30",
      btnText: "Activate",
    },
    delete: {
      title: "Delete User Permanently",
      desc: `This will permanently delete ${userName}'s account and ALL associated data (accounts, transactions, cards, KYC, tickets). This action cannot be undone.`,
      icon: Trash2,
      panel: "bg-error/5 border-error/20",
      header: "text-error",
      btnClass:
        "bg-error/20 text-error border border-error/30 hover:bg-error/30",
      btnText: "Delete Permanently",
    },
  } as const;

  return (
    <div className="w-full sm:w-auto">
      {/* Dropdown trigger (disabled while a confirmation is showing, to
          keep focus on the current action) */}
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          disabled={confirmAction !== null}
          className="flex items-center gap-1.5 rounded-lg bg-navy-700 border border-border-subtle px-3 py-2 text-sm font-medium text-text-primary hover:border-gold-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MoreVertical className="h-4 w-4" />
          <span className="hidden sm:inline">Actions</span>
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-40 w-48 rounded-lg bg-navy-800 border border-border-default shadow-xl overflow-hidden animate-fade-in">
              {hasAccounts && !allAccountsDormant && (
                <button
                  type="button"
                  onClick={() => pick("dormant")}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-warning hover:bg-navy-700 transition-colors"
                >
                  <PowerOff className="h-4 w-4" />
                  Set Dormant
                </button>
              )}
              {hasAccounts && allAccountsDormant && (
                <button
                  type="button"
                  onClick={() => pick("activate")}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-success hover:bg-navy-700 transition-colors"
                >
                  <Power className="h-4 w-4" />
                  Activate Accounts
                </button>
              )}
              <button
                type="button"
                onClick={() => pick("delete")}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-error hover:bg-navy-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </button>
            </div>
          </>
        )}
      </div>

      {/* Inline confirmation panel — same pattern as KycActions /
          TransferActions. Renders in normal document flow directly
          below the dropdown trigger, so the Confirm button is always
          reachable by scrolling on mobile. */}
      {confirmAction && (
        <div
          className={`mt-3 rounded-lg border p-4 ${actionConfig[confirmAction].panel}`}
        >
          <div
            className={`flex items-center gap-2 text-sm font-semibold mb-2 ${actionConfig[confirmAction].header}`}
          >
            <AlertTriangle className="h-4 w-4" />
            {actionConfig[confirmAction].title}
          </div>

          <p className="text-sm text-text-secondary mb-4 break-words">
            {actionConfig[confirmAction].desc}
          </p>

          {error && (
            <div className="mb-3 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error">
              {error}
            </div>
          )}

          {/* Confirm / Cancel — stacked full-width on mobile, primary
              button first so it's the most prominent control */}
          <div className="flex flex-col sm:flex-row-reverse gap-2">
            <button
              type="button"
              onClick={handleAction}
              disabled={loading}
              className={`w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 ${actionConfig[confirmAction].btnClass}`}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {actionConfig[confirmAction].btnText}
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
        </div>
      )}
    </div>
  );
}
