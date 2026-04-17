"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  CreditCard,
  Snowflake,
  CheckCircle,
  Ban,
  Edit,
  X,
  Loader2,
} from "lucide-react";

interface AccountOption {
  id: string;
  label: string;
}

interface Card {
  id: string;
  accountId: string;
  type: string;
  lastFour: string;
  cardholderName: string;
  status: string;
  dailyLimit: number;
}

interface CardActionsProps {
  mode: "header" | "row";
  accounts?: AccountOption[];
  card?: Card;
}

export default function CardActions({ mode, accounts, card }: CardActionsProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionType, setActionType] = useState<"status" | "limit" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Create form
  const [createForm, setCreateForm] = useState({
    accountId: "",
    type: "VISA",
    cardholderName: "",
    dailyLimit: "5000",
  });

  // Status
  const [newStatus, setNewStatus] = useState("");

  // Limit
  const [newLimit, setNewLimit] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: createForm.accountId,
          type: createForm.type,
          cardholderName: createForm.cardholderName,
          dailyLimit: parseFloat(createForm.dailyLimit),
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to create card");
        return;
      }
      setShowCreateModal(false);
      setCreateForm({ accountId: "", type: "VISA", cardholderName: "", dailyLimit: "5000" });
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate() {
    if (!card || !newStatus) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Update failed");
        return;
      }
      setActionType(null);
      setNewStatus("");
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleLimitUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!card || !newLimit) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, dailyLimit: parseFloat(newLimit) }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Update failed");
        return;
      }
      setActionType(null);
      setNewLimit("");
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
          Issue New Card
        </button>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gold-500" />
                  Issue New Card
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

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Account</label>
                  <select
                    value={createForm.accountId}
                    onChange={(e) => setCreateForm({ ...createForm, accountId: e.target.value })}
                    required
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  >
                    <option value="">Select account...</option>
                    {accounts?.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Card Type</label>
                  <select
                    value={createForm.type}
                    onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  >
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    value={createForm.cardholderName}
                    onChange={(e) => setCreateForm({ ...createForm, cardholderName: e.target.value })}
                    required
                    placeholder="JOHN DOE"
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Daily Limit ($)</label>
                  <input
                    type="number"
                    step="100"
                    min="100"
                    value={createForm.dailyLimit}
                    onChange={(e) => setCreateForm({ ...createForm, dailyLimit: e.target.value })}
                    className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gold-gradient rounded-lg py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Issue Card
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Row actions — direct buttons, no floating dropdown. Same reasoning
  // as AccountActions: a `top-full` dropdown on the last cards of the
  // page got clipped by the table's `overflow-hidden` ancestor, making
  // the options invisible. Direct buttons are in document flow, always
  // visible, always tappable, across all viewports.
  function cancelRowAction() {
    setActionType(null);
    setNewStatus("");
    setNewLimit("");
    setError("");
  }

  return (
    <div className="w-full">
      {!actionType && (
        <div className="flex flex-wrap gap-2">
          {card?.status !== "ACTIVE" && (
            <button
              type="button"
              onClick={() => {
                setNewStatus("ACTIVE");
                setActionType("status");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Unfreeze
            </button>
          )}
          {card?.status === "ACTIVE" && (
            <button
              type="button"
              onClick={() => {
                setNewStatus("FROZEN");
                setActionType("status");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
            >
              <Snowflake className="h-3.5 w-3.5" />
              Freeze
            </button>
          )}
          {card?.status !== "CANCELLED" && (
            <button
              type="button"
              onClick={() => {
                setNewStatus("CANCELLED");
                setActionType("status");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-error/10 text-error border border-error/20 hover:bg-error/20 transition-colors"
            >
              <Ban className="h-3.5 w-3.5" />
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setNewLimit(card?.dailyLimit?.toString() || "5000");
              setActionType("limit");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-navy-800/50 text-text-secondary border border-border-default hover:border-gold-500/40 hover:text-gold-400 transition-colors"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Limit
          </button>
        </div>
      )}

      {/* Inline confirmation panel — same pattern as KycActions */}
      {actionType && card && (
        <div className="mt-3 rounded-lg border border-gold-500/20 bg-gold-500/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold mb-3 text-gold-400">
            {actionType === "status" && <Snowflake className="h-4 w-4" />}
            {actionType === "limit" && <Edit className="h-4 w-4" />}
            {actionType === "status" ? `Set card status to ${newStatus}?` : "Edit daily limit"}
          </div>

          <div className="mb-3 rounded-lg bg-navy-900/50 border border-border-default p-3">
            <p className="text-xs text-text-muted">Card</p>
            <p className="text-text-primary font-mono text-sm">
              **** **** **** {card.lastFour}
            </p>
            <p className="text-xs text-text-muted mt-1 break-words">
              {card.cardholderName} — {card.type}
            </p>
          </div>

          {error && (
            <div className="mb-3 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error">
              {error}
            </div>
          )}

          {actionType === "status" && (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                Confirm setting card status to{" "}
                <span className="font-semibold text-text-primary">
                  {newStatus}
                </span>
                ?
              </p>
              <div className="flex flex-col sm:flex-row-reverse gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={loading}
                  className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-semibold gold-gradient text-navy-950 hover:opacity-90 disabled:opacity-50"
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
            </div>
          )}

          {actionType === "limit" && (
            <form onSubmit={handleLimitUpdate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  New Daily Limit ($)
                </label>
                <input
                  type="number"
                  step="100"
                  min="100"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  required
                  className="w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
                />
              </div>
              <div className="flex flex-col sm:flex-row-reverse gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 sm:py-2.5 text-sm font-semibold gold-gradient text-navy-950 hover:opacity-90 disabled:opacity-50"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Update Limit
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
