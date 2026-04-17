"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreVertical,
  CreditCard,
  Ban,
  CheckCircle,
  Snowflake,
  ArrowUpCircle,
  ArrowDownCircle,
  X,
  Loader2,
} from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Account {
  id: string;
  accountNumber: string;
  type: string;
  label: string;
  balance: number;
  currency: string;
  status: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

interface AccountActionsProps {
  mode: "header" | "row";
  users?: User[];
  account?: Account;
}

/**
 * Admin actions for an account: credit it, debit it, or change its status.
 *
 * Row-mode confirmation panel unfolds INLINE below the dropdown trigger
 * (same pattern as KycActions / TransferActions / UserActions). Previously
 * this opened a `fixed inset-0` modal which on iOS Safari could hide the
 * Confirm button behind the keyboard with no way to scroll to it.
 *
 * Header-mode (Create Account) is still a modal because it's a multi-field
 * form that genuinely needs its own space, and it's a CREATE action — not
 * a confirmation of something already submitted by a user.
 */
export default function AccountActions({
  mode,
  users,
  account,
}: AccountActionsProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [actionType, setActionType] = useState<
    "CREDIT" | "DEBIT" | "STATUS" | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState({
    userId: "",
    type: "CHECKING",
    label: "",
    currency: "USD",
  });

  const [cdForm, setCdForm] = useState({
    amount: "",
    description: "",
  });

  const [newStatus, setNewStatus] = useState("");

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create account");
        return;
      }
      setShowCreateModal(false);
      setCreateForm({ userId: "", type: "CHECKING", label: "", currency: "USD" });
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  function cancelRowAction() {
    setActionType(null);
    setNewStatus("");
    setCdForm({ amount: "", description: "" });
    setError("");
  }

  function pickRowAction(
    next: "CREDIT" | "DEBIT" | "STATUS",
    statusValue?: string
  ) {
    setActionType(next);
    setNewStatus(statusValue || "");
    setCdForm({ amount: "", description: "" });
    setError("");
    setShowDropdown(false);
  }

  async function handleCreditDebit(e: React.FormEvent) {
    e.preventDefault();
    if (!account || !actionType || actionType === "STATUS") return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account.id,
          type: actionType,
          amount: parseFloat(cdForm.amount),
          description: cdForm.description,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Operation failed");
        return;
      }
      cancelRowAction();
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(e: React.FormEvent) {
    e.preventDefault();
    if (!account || !newStatus) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Status update failed");
        return;
      }
      cancelRowAction();
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "header") {
    return (
      <>
        <button
          onClick={() => setShowCreateModal(true)}
          className="gold-gradient rounded-lg px-5 py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Account
        </button>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gold-500" />
                  Create New Account
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    User
                  </label>
                  <select
                    value={createForm.userId}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, userId: e.target.value })
                    }
                    required
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  >
                    <option value="">Select user...</option>
                    {users?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Account Type
                  </label>
                  <select
                    value={createForm.type}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, type: e.target.value })
                    }
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  >
                    <option value="CHECKING">Checking</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={createForm.label}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, label: e.target.value })
                    }
                    placeholder="e.g., Primary Checking"
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Currency
                  </label>
                  <select
                    value={createForm.currency}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, currency: e.target.value })
                    }
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-gradient rounded-lg py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Account
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Row actions — dropdown + inline confirmation panel
  return (
    <div className="w-full sm:w-auto">
      <div className="relative inline-block">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={actionType !== null}
          className="p-2 rounded-lg hover:bg-navy-800/50 text-text-muted hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Account actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-50 w-48 glass glass-border rounded-xl py-1 shadow-xl">
              <button
                onClick={() => pickRowAction("CREDIT")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-success hover:bg-navy-800/50 transition-colors"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Credit Account
              </button>
              <button
                onClick={() => pickRowAction("DEBIT")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-navy-800/50 transition-colors"
              >
                <ArrowDownCircle className="h-4 w-4" />
                Debit Account
              </button>
              <div className="border-t border-border-default my-1" />
              {account?.status !== "ACTIVE" && (
                <button
                  onClick={() => pickRowAction("STATUS", "ACTIVE")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-navy-800/50 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Set Active
                </button>
              )}
              {account?.status !== "FROZEN" && (
                <button
                  onClick={() => pickRowAction("STATUS", "FROZEN")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-400 hover:bg-navy-800/50 transition-colors"
                >
                  <Snowflake className="h-4 w-4" />
                  Freeze Account
                </button>
              )}
              {account?.status !== "RESTRICTED" && (
                <button
                  onClick={() => pickRowAction("STATUS", "RESTRICTED")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-warning hover:bg-navy-800/50 transition-colors"
                >
                  <Ban className="h-4 w-4" />
                  Restrict Account
                </button>
              )}
              {account?.status !== "DORMANT" && (
                <button
                  onClick={() => pickRowAction("STATUS", "DORMANT")}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-warning hover:bg-navy-800/50 transition-colors"
                >
                  <Ban className="h-4 w-4" />
                  Set Dormant
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Inline confirmation panel */}
      {actionType && account && (
        <div
          className={`mt-3 rounded-lg border p-4 ${
            actionType === "CREDIT"
              ? "bg-success/5 border-success/20"
              : actionType === "DEBIT"
              ? "bg-error/5 border-error/20"
              : "bg-warning/5 border-warning/20"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm font-semibold mb-3 ${
              actionType === "CREDIT"
                ? "text-success"
                : actionType === "DEBIT"
                ? "text-error"
                : "text-warning"
            }`}
          >
            {actionType === "CREDIT" && <ArrowUpCircle className="h-4 w-4" />}
            {actionType === "DEBIT" && <ArrowDownCircle className="h-4 w-4" />}
            {actionType === "STATUS" && <CheckCircle className="h-4 w-4" />}
            {actionType === "CREDIT" && "Credit this account"}
            {actionType === "DEBIT" && "Debit this account"}
            {actionType === "STATUS" && `Change status to ${newStatus}?`}
          </div>

          <div className="mb-3 rounded-lg bg-navy-900/50 border border-border-default p-3">
            <p className="text-xs text-text-muted">Account</p>
            <p className="text-text-primary font-mono text-sm">
              {account.accountNumber}
            </p>
            <p className="text-xs text-text-muted mt-1 break-words">
              {account.user.firstName} {account.user.lastName} — Balance:{" "}
              {account.currency}{" "}
              {account.balance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {error && (
            <div className="mb-3 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error">
              {error}
            </div>
          )}

          {(actionType === "CREDIT" || actionType === "DEBIT") && (
            <form onSubmit={handleCreditDebit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={cdForm.amount}
                  onChange={(e) =>
                    setCdForm({ ...cdForm, amount: e.target.value })
                  }
                  required
                  placeholder="0.00"
                  className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={cdForm.description}
                  onChange={(e) =>
                    setCdForm({ ...cdForm, description: e.target.value })
                  }
                  required
                  placeholder={
                    actionType === "CREDIT"
                      ? "e.g., Wire transfer deposit"
                      : "e.g., Fee deduction"
                  }
                  className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>

              <div className="flex flex-col sm:flex-row-reverse gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 ${
                    actionType === "CREDIT"
                      ? "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                      : "bg-error/20 text-error border border-error/30 hover:bg-error/30"
                  }`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm {actionType === "CREDIT" ? "Credit" : "Debit"}
                </button>
                <button
                  type="button"
                  onClick={cancelRowAction}
                  disabled={loading}
                  className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center rounded-lg px-4 py-3 sm:py-2.5 text-sm font-medium border border-border-default text-text-secondary hover:bg-navy-800/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {actionType === "STATUS" && (
            <form onSubmit={handleStatusChange} className="space-y-3">
              <p className="text-sm text-text-secondary">
                Set account status to{" "}
                <span className="font-semibold text-text-primary">
                  {newStatus}
                </span>
                ?
              </p>

              <div className="flex flex-col sm:flex-row-reverse gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-semibold bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30 transition-opacity disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={cancelRowAction}
                  disabled={loading}
                  className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center rounded-lg px-4 py-3 sm:py-2.5 text-sm font-medium border border-border-default text-text-secondary hover:bg-navy-800/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
