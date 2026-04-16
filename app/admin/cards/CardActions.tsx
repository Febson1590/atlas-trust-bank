"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  MoreVertical,
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
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
      setShowActionModal(false);
      setActionType(null);
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
      setShowActionModal(false);
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
            <div className="absolute right-0 top-full mt-1 z-50 w-44 glass glass-border rounded-xl py-1 shadow-xl">
              {card?.status !== "ACTIVE" && (
                <button
                  onClick={() => {
                    setNewStatus("ACTIVE");
                    setActionType("status");
                    setShowDropdown(false);
                    setShowActionModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-success hover:bg-navy-800/50 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Unfreeze
                </button>
              )}
              {card?.status === "ACTIVE" && (
                <button
                  onClick={() => {
                    setNewStatus("FROZEN");
                    setActionType("status");
                    setShowDropdown(false);
                    setShowActionModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-400 hover:bg-navy-800/50 transition-colors"
                >
                  <Snowflake className="h-4 w-4" />
                  Freeze
                </button>
              )}
              {card?.status !== "CANCELLED" && (
                <button
                  onClick={() => {
                    setNewStatus("CANCELLED");
                    setActionType("status");
                    setShowDropdown(false);
                    setShowActionModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-navy-800/50 transition-colors"
                >
                  <Ban className="h-4 w-4" />
                  Cancel
                </button>
              )}
              <div className="border-t border-border-default my-1" />
              <button
                onClick={() => {
                  setNewLimit(card?.dailyLimit?.toString() || "5000");
                  setActionType("limit");
                  setShowDropdown(false);
                  setShowActionModal(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-navy-800/50 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Limit
              </button>
            </div>
          </>
        )}
      </div>

      {showActionModal && card && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowActionModal(false); setActionType(null); setError(""); }} />
          <div className="relative glass glass-border rounded-2xl p-6 w-full max-w-md animate-fade-in max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">
                {actionType === "status" ? `Set Card ${newStatus}` : "Edit Daily Limit"}
              </h2>
              <button onClick={() => { setShowActionModal(false); setActionType(null); setError(""); }} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-navy-900/50 border border-border-default">
              <p className="text-sm text-text-muted">Card</p>
              <p className="text-text-primary font-mono">**** **** **** {card.lastFour}</p>
              <p className="text-xs text-text-muted mt-1">{card.cardholderName} — {card.type}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}

            {actionType === "status" && (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">
                  Set card status to <span className="font-semibold text-text-primary">{newStatus}</span>?
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
                    onClick={handleStatusUpdate}
                    disabled={loading}
                    className="flex-1 gold-gradient rounded-lg py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {actionType === "limit" && (
              <form onSubmit={handleLimitUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">New Daily Limit ($)</label>
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
                    className="flex-1 gold-gradient rounded-lg py-2.5 text-sm font-semibold text-navy-950 hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Update Limit
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
