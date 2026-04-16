"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  Euro,
  PoundSterling,
  Bitcoin,
} from "lucide-react";

interface GeneratorUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountCount: number;
  displayLabel: string;
}

interface GeneratorResult {
  userId: string;
  userName: string;
  totalCredit: number;
  totalDebit: number;
  finalBalanceUsd: number;
  shares: {
    primary: number;
    eur: number;
    gbp: number;
    btc: number;
  };
  fxRates?: {
    btcUsdSpot: number;
    btcPriceSource: "live" | "fallback";
  };
  accounts: {
    primaryChecking: { currency: string; balance: number };
    eur: { currency: string; balance: number };
    gbp: { currency: string; balance: number };
    btc: { currency: string; balance: number };
  };
  transactionCount: number;
}

function formatNumber(n: number, currency: string): string {
  if (currency === "BTC") {
    return `₿ ${n.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    })}`;
  }
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export default function GeneratorForm({ users }: { users: GeneratorUser[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    userId: "",
    totalCredit: "25000",
    totalDebit: "8000",
    months: "6",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratorResult | null>(null);

  const creditNum = parseFloat(form.totalCredit) || 0;
  const debitNum = parseFloat(form.totalDebit) || 0;
  const projectedBalance = creditNum - debitNum;

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
          userId: form.userId,
          totalCredit: creditNum,
          totalDebit: debitNum,
          months: parseInt(form.months, 10) || 6,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Generation failed");
        return;
      }
      setResult(data.data as GeneratorResult);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedUser = users.find((u) => u.id === form.userId);
  const canSubmit =
    form.userId && creditNum >= 0 && debitNum >= 0 && projectedBalance >= 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
        <form
          onSubmit={handleSubmit}
          className="glass glass-border rounded-xl p-5 sm:p-6 space-y-5"
        >
          {/* User */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <UserIcon className="h-4 w-4 text-gold-500" />
              Fund target user
            </label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
              className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            >
              <option value="">Choose a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayLabel}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-muted mt-1.5">
              The four default accounts (Primary Checking, EUR, GBP, BTC
              Wallet) will be funded for this user. Existing transaction
              history on those accounts will be replaced.
            </p>
          </div>

          {/* Credit + Debit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Total credit (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.totalCredit}
                onChange={(e) =>
                  setForm({ ...form, totalCredit: e.target.value })
                }
                required
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
              />
              <p className="text-xs text-text-muted mt-1">
                Sum of all generated credit transactions
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                <TrendingDown className="h-4 w-4 text-error" />
                Total debit (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.totalDebit}
                onChange={(e) =>
                  setForm({ ...form, totalDebit: e.target.value })
                }
                required
                className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
              />
              <p className="text-xs text-text-muted mt-1">
                Sum of all generated debit transactions
              </p>
            </div>
          </div>

          {/* Months */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
              <Calendar className="h-4 w-4 text-gold-500" />
              History length (months)
            </label>
            <input
              type="number"
              min="1"
              max="36"
              value={form.months}
              onChange={(e) => setForm({ ...form, months: e.target.value })}
              className="w-full bg-navy-900/50 border border-border-default rounded-lg py-3 px-4 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20"
            />
            <p className="text-xs text-text-muted mt-1">
              Transactions will be spread across the last N months
            </p>
          </div>

          {/* Projected balance preview */}
          <div className="rounded-lg bg-navy-900/50 border border-border-default px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-text-muted">
              Projected final USD balance
            </span>
            <span
              className={`text-base font-semibold ${
                projectedBalance >= 0 ? "gold-text" : "text-error"
              }`}
            >
              {formatNumber(projectedBalance, "USD")}
            </span>
          </div>

          {projectedBalance < 0 && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Final balance cannot be negative. Total credit must be at
                least total debit.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full gold-gradient rounded-lg py-3 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Selected user card */}
        {selectedUser && (
          <div className="glass glass-border rounded-xl p-5 card-shine">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
              Selected user
            </h3>
            <p className="text-text-primary font-semibold">
              {selectedUser.firstName} {selectedUser.lastName}
            </p>
            <p className="text-text-muted text-xs break-all mt-0.5">
              {selectedUser.email}
            </p>
            <p className="text-text-muted text-xs mt-2">
              {selectedUser.accountCount} existing account
              {selectedUser.accountCount === 1 ? "" : "s"} · missing defaults
              (USD / EUR / GBP / BTC) will be created automatically
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="glass glass-border rounded-xl p-5 border-success/20 bg-success/5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <h3 className="text-sm font-semibold text-success">
                Generation complete
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">User</span>
                <span className="text-text-primary font-medium break-all text-right">
                  {result.userName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Transactions</span>
                <span className="text-text-primary font-semibold">
                  {result.transactionCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total credit</span>
                <span className="text-success">
                  {formatNumber(result.totalCredit, "USD")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Total debit</span>
                <span className="text-error">
                  {formatNumber(result.totalDebit, "USD")}
                </span>
              </div>
              <div className="flex justify-between border-t border-border-subtle/50 pt-2">
                <span className="text-text-muted">Final USD base</span>
                <span className="gold-text font-semibold">
                  {formatNumber(result.finalBalanceUsd, "USD")}
                </span>
              </div>

              {result.fxRates && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">BTC spot</span>
                  <span className="text-text-secondary">
                    {formatNumber(result.fxRates.btcUsdSpot, "USD")}
                    <span className="text-text-muted ml-1">
                      ({result.fxRates.btcPriceSource})
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Per-account breakdown */}
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Final balances
              </p>
              <div className="flex items-center justify-between rounded-lg bg-navy-900/40 px-3 py-2 border border-border-subtle/40">
                <span className="flex items-center gap-2 text-text-secondary">
                  <Wallet className="h-4 w-4 text-gold-500" />
                  Primary Checking
                </span>
                <span className="text-text-primary font-semibold">
                  {formatNumber(
                    result.accounts.primaryChecking.balance,
                    result.accounts.primaryChecking.currency
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-navy-900/40 px-3 py-2 border border-border-subtle/40">
                <span className="flex items-center gap-2 text-text-secondary">
                  <Euro className="h-4 w-4 text-blue-400" />
                  EUR Account
                </span>
                <span className="text-text-primary font-semibold">
                  {formatNumber(
                    result.accounts.eur.balance,
                    result.accounts.eur.currency
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-navy-900/40 px-3 py-2 border border-border-subtle/40">
                <span className="flex items-center gap-2 text-text-secondary">
                  <PoundSterling className="h-4 w-4 text-purple-400" />
                  GBP Account
                </span>
                <span className="text-text-primary font-semibold">
                  {formatNumber(
                    result.accounts.gbp.balance,
                    result.accounts.gbp.currency
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-navy-900/40 px-3 py-2 border border-border-subtle/40">
                <span className="flex items-center gap-2 text-text-secondary">
                  <Bitcoin className="h-4 w-4 text-orange-400" />
                  BTC Wallet
                </span>
                <span className="text-text-primary font-semibold">
                  {formatNumber(
                    result.accounts.btc.balance,
                    result.accounts.btc.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="glass glass-border rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            How it works
          </h3>
          <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
            <li>Choose a user and enter total credit + total debit in USD</li>
            <li>
              Primary Checking gets{" "}
              <span className="text-gold-500">65–75%</span> of the final USD
              balance
            </li>
            <li>
              The rest is split randomly across EUR, GBP, and BTC accounts
            </li>
            <li>
              USD values are converted via hardcoded EUR/GBP rates and the{" "}
              <span className="text-gold-500">live CoinGecko BTC spot</span>
            </li>
            <li>
              Per-account transactions are interleaved across the history
              window with a running balance that never dips below zero
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
