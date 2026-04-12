"use client";

import { useState } from "react";
import {
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
  Wallet,
  Calendar,
  Hash,
  DollarSign,
} from "lucide-react";

interface Account {
  id: string;
  accountNumber: string;
  label: string;
  type: string;
  balance: number;
  currency: string;
  userName: string;
  displayLabel: string;
}

interface GeneratorResult {
  count: number;
  accountNumber: string;
  accountLabel: string;
  userName: string;
}

export default function GeneratorForm({ accounts }: { accounts: Account[] }) {
  const [form, setForm] = useState({
    accountId: "",
    count: "25",
    startDate: "",
    endDate: "",
    minAmount: "10",
    maxAmount: "5000",
    types: ["CREDIT", "DEBIT"] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratorResult | null>(null);

  // Set default dates on mount
  useState(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    setForm((prev) => ({
      ...prev,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    }));
  });

  function toggleType(type: string) {
    setForm((prev) => {
      const types = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      // Ensure at least one is selected
      if (types.length === 0) return prev;
      return { ...prev, types };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: form.accountId,
          count: parseInt(form.count),
          startDate: form.startDate,
          endDate: form.endDate,
          minAmount: parseFloat(form.minAmount),
          maxAmount: parseFloat(form.maxAmount),
          types: form.types,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Generation failed");
        return;
      }

      setResult(data.data);
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const selectedAccount = accounts.find((a) => a.id === form.accountId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="glass glass-border rounded-xl p-6 space-y-6">
          {/* Account Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Wallet className="h-4 w-4 text-gold-500" />
              Select Account
            </label>
            <select
              value={form.accountId}
              onChange={(e) => setForm({ ...form, accountId: e.target.value })}
              required
              className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            >
              <option value="">Choose an account...</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Hash className="h-4 w-4 text-gold-500" />
              Number of Transactions
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={form.count}
              onChange={(e) => setForm({ ...form, count: e.target.value })}
              required
              className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            />
            <p className="text-xs text-text-muted mt-1">Between 1 and 100 transactions</p>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <Calendar className="h-4 w-4 text-gold-500" />
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <Calendar className="h-4 w-4 text-gold-500" />
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <DollarSign className="h-4 w-4 text-gold-500" />
                Min Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.minAmount}
                onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                required
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <DollarSign className="h-4 w-4 text-gold-500" />
                Max Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.maxAmount}
                onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
                required
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
              />
            </div>
          </div>

          {/* Transaction Types */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Transaction Types
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => toggleType("CREDIT")}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    form.types.includes("CREDIT")
                      ? "bg-success/20 border-success text-success"
                      : "border-border-default bg-navy-900/50 text-transparent group-hover:border-text-muted"
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Credit</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => toggleType("DEBIT")}
                  className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                    form.types.includes("DEBIT")
                      ? "bg-error/20 border-error text-error"
                      : "border-border-default bg-navy-900/50 text-transparent group-hover:border-text-muted"
                  }`}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">Debit</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.accountId}
            className="w-full gold-gradient rounded-lg py-3 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Transactions
              </>
            )}
          </button>
        </form>
      </div>

      {/* Sidebar Info */}
      <div className="space-y-6">
        {/* Selected Account Info */}
        {selectedAccount && (
          <div className="glass glass-border rounded-xl p-6 card-shine">
            <h3 className="text-sm font-medium text-text-muted mb-3">Selected Account</h3>
            <div className="space-y-3">
              <div>
                <p className="text-text-primary font-semibold">{selectedAccount.userName}</p>
                <p className="text-text-muted text-xs font-mono">{selectedAccount.accountNumber}</p>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Type</span>
                <span className="text-text-secondary capitalize">{selectedAccount.type.toLowerCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Balance</span>
                <span className="text-text-primary font-semibold">
                  {selectedAccount.currency} {selectedAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Label</span>
                <span className="text-text-secondary">{selectedAccount.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="glass glass-border rounded-xl p-6 border-success/20 bg-success/5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <h3 className="text-sm font-semibold text-success">Generation Complete</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Transactions Created</span>
                <span className="text-text-primary font-semibold">{result.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Account</span>
                <span className="text-text-primary font-mono text-xs">{result.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">User</span>
                <span className="text-text-primary">{result.userName}</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="glass glass-border rounded-xl p-6">
          <h3 className="text-sm font-medium text-text-muted mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="gold-text font-semibold mt-0.5">1.</span>
              Select a target account
            </li>
            <li className="flex items-start gap-2">
              <span className="gold-text font-semibold mt-0.5">2.</span>
              Set the number of transactions (1-100)
            </li>
            <li className="flex items-start gap-2">
              <span className="gold-text font-semibold mt-0.5">3.</span>
              Choose date range and amount range
            </li>
            <li className="flex items-start gap-2">
              <span className="gold-text font-semibold mt-0.5">4.</span>
              Select credit, debit, or both types
            </li>
            <li className="flex items-start gap-2">
              <span className="gold-text font-semibold mt-0.5">5.</span>
              Transactions are generated with realistic descriptions and running balances
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
