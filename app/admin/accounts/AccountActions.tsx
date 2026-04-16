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

export default function AccountActions({ mode, users, account }: AccountActionsProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [actionType, setActionType] = useState<"CREDIT" | "DEBIT" | "STATUS" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create account form state
  const [createForm, setCreateForm] = useState({
    userId: "",
    type: "CHECKING",
    label: "",
    currency: "USD",
  });

  // Credit/Debit form state
  const [cdForm, setCdForm] = useState({
    amount: "",
    description: "",
  });

  // Status form state
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
      setShowActionModal(false);
      setCdForm({ amount: "", description: "" });
      setActionType(null);
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
      setShowActionModal(false);
      setNewStatus("");
      setActionType(null);
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

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gold-500" />
                  Create New Account
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="text-text-muted hover:text-text-primary transition-colors">
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
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">User</label>
                  <select
                    value={createForm.userId}
                    onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
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
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Account Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  >
                    <option value="CHECKING">Checking</option>
                    <option value="SAVINGS">Savings</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Label (optional)</label>
                  <input
                    type="text"
                    value={createForm.label}
                    onChange={(e) => setCreateForm({ ...createForm, label: e.target.value })}
                    placeholder="e.g., Primary Checking"
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Currency</label>
                  <select
                    value={createForm.currency}
                    onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
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

  // Row actions
  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 rounded-lg hover:bg-navy-800/50 text-text-muted hover:text-text-primary transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 top-full mt-1 z-50 w-48 glass glass-border rounded-xl py-1 shadow-xl">
              <button
                onClick={() => {
                  setActionType("CREDIT");
                  setShowDropdown(false);
                  setShowActionModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-success hover:bg-navy-800/50 transition-colors"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Credit Account
              </button>
              <button
                onClick={() => {
                  setActionType("DEBIT");
                  setShowDropdown(false);
                  setShowActionModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-navy-800/50 transition-colors"
              >
                <ArrowDownCircle className="h-4 w-4" />
                Debit Account
              </button>
              <div className="border-t border-border-default my-1" />
              {account?.status !== "ACTIVE" && (
                <button
                  onClick={() => {
                    setActionType("STATUS");
                    setNewStatus("ACTIVE");
                    setShowDropdown(false);
                    setShowActionModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-navy-800/50 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Set Active
                </button>
              )}
              {account?.status !== "FROZEN" && (
                <button
                  onClick={() => {
                    setActionType("STATUS");
                    setNewStatus("FROZEN");
                    setShowDropdown(false);
                    setShowActionModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-400 hover:bg-navy-800/50 transition-colors"
                >
                  <Snowflake className="h-4 w-4" />
                  Freeze Account
                </button>
              )}
              {account?.status !== "RESTRICTED" && (
                <button
                  onClick={() => {
                    setActionType("STATUS");
                    setNewStatus("RESTRICTED");
                    setShowDropdown(false);
                    setShowActionModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-warning hover:bg-navy-800/50 transition-colors"
                >
                  <Ban className="h-4 w-4" />
                  Restrict Account
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && account && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowActionModal(false); setActionType(null); setError(""); }} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {actionType === "CREDIT" && "Credit Account"}
                {actionType === "DEBIT" && "Debit Account"}
                {actionType === "STATUS" && `Change Status to ${newStatus}`}
              </h2>
              <button onClick={() => { setShowActionModal(false); setActionType(null); setError(""); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-navy-900/50 border border-border-default">
              <p className="text-sm text-text-muted">Account</p>
              <p className="text-text-primary font-mono">{account.accountNumber}</p>
              <p className="text-xs text-text-muted mt-1">
                {account.user.firstName} {account.user.lastName} &mdash; Balance: {account.currency} {account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            {(actionType === "CREDIT" || actionType === "DEBIT") && (
              <form onSubmit={handleCreditDebit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={cdForm.amount}
                    onChange={(e) => setCdForm({ ...cdForm, amount: e.target.value })}
                    required
                    placeholder="0.00"
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                  <input
                    type="text"
                    value={cdForm.description}
                    onChange={(e) => setCdForm({ ...cdForm, description: e.target.value })}
                    required
                    placeholder={actionType === "CREDIT" ? "e.g., Wire transfer deposit" : "e.g., Fee deduction"}
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${
                    actionType === "CREDIT"
                      ? "bg-success/20 text-success border border-success/30 hover:bg-success/30"
                      : "bg-error/20 text-error border border-error/30 hover:bg-error/30"
                  }`}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm {actionType === "CREDIT" ? "Credit" : "Debit"}
                </button>
              </form>
            )}

            {actionType === "STATUS" && (
              <form onSubmit={handleStatusChange} className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Are you sure you want to change the account status to <span className="font-semibold text-text-primary">{newStatus}</span>?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowActionModal(false); setActionType(null); }}
                    className="flex-1 py-2.5 text-sm border border-border-default rounded-lg text-text-secondary hover:bg-navy-800/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 gold-gradient rounded-lg py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirm
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
