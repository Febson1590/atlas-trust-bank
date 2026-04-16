"use client";

import { useState, useEffect } from "react";
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
  Hash,
  DollarSign,
  Wallet,
  Euro,
  PoundSterling,
  Bitcoin,
  Settings2,
  FileText,
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
  userName: string;
  totalCredit: number;
  totalDebit: number;
  finalBalanceUsd: number;
  mode: string;
  pattern: string;
  fxRates?: { btcUsdSpot: number; btcPriceSource: string };
  shares: Record<string, number>;
  accounts: Record<string, number>;
  transactionCount: number;
}

function fmt(n: number, cur: string): string {
  if (cur === "BTC")
    return `₿ ${n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 8 })}`;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cur,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${cur} ${n.toFixed(2)}`;
  }
}

const PATTERNS = [
  { value: "random", label: "Random", hint: "Evenly distributed" },
  { value: "highActivity", label: "High Activity", hint: "More transactions, wider spread" },
  { value: "salaryBased", label: "Salary-based", hint: "Credits cluster around 1st/15th" },
] as const;

export default function GeneratorForm({ users }: { users: GeneratorUser[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    userId: "",
    totalCredit: "25000",
    totalDebit: "8000",
    startDate: "",
    endDate: "",
    txCount: "40",
    minAmount: "10",
    maxAmount: "5000",
    pattern: "random",
    primaryMinPct: "65",
    primaryMaxPct: "75",
    creditDescs: "",
    debitDescs: "",
    mode: "replace",
  });

  // Default dates: 6 months ago → today
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    setForm((p) => ({
      ...p,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    }));
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GeneratorResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const creditNum = parseFloat(form.totalCredit) || 0;
  const debitNum = parseFloat(form.totalDebit) || 0;
  const projBal = creditNum - debitNum;
  const minPct = parseFloat(form.primaryMinPct) || 65;
  const maxPct = parseFloat(form.primaryMaxPct) || 75;
  const midPct = (minPct + maxPct) / 2 / 100;
  const restPct = 1 - midPct;

  // Projected distribution preview (USD base)
  const projPrimary = projBal * midPct;
  const projRest = projBal * restPct;
  const projEach = projRest / 3;

  const canSubmit =
    form.userId &&
    creditNum >= 0 &&
    debitNum >= 0 &&
    projBal >= 0 &&
    form.startDate &&
    form.endDate &&
    minPct <= maxPct;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const creditDescs = form.creditDescs
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const debitDescs = form.debitDescs
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/admin/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          totalCredit: creditNum,
          totalDebit: debitNum,
          startDate: form.startDate,
          endDate: form.endDate,
          txCount: parseInt(form.txCount, 10) || undefined,
          minAmount: parseFloat(form.minAmount) || undefined,
          maxAmount: parseFloat(form.maxAmount) || undefined,
          pattern: form.pattern,
          primaryMinPct: minPct,
          primaryMaxPct: maxPct,
          ...(creditDescs.length > 0 ? { creditDescriptions: creditDescs } : {}),
          ...(debitDescs.length > 0 ? { debitDescriptions: debitDescs } : {}),
          mode: form.mode,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Generation failed");
        return;
      }
      setResult(data.data);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedUser = users.find((u) => u.id === form.userId);

  const inputCls =
    "w-full bg-navy-900/50 border border-border-default rounded-lg py-2.5 px-3 text-sm text-text-primary focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20";
  const labelCls = "flex items-center gap-2 text-sm font-medium text-text-secondary mb-1.5";

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
            <label className={labelCls}>
              <UserIcon className="h-4 w-4 text-gold-500" /> Target user
            </label>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              required
              className={inputCls}
            >
              <option value="">Choose a user...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayLabel}
                </option>
              ))}
            </select>
          </div>

          {/* Credit + Debit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <TrendingUp className="h-4 w-4 text-success" /> Total credit
                (USD)
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
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                <TrendingDown className="h-4 w-4 text-error" /> Total debit
                (USD)
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
                className={inputCls}
              />
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <Calendar className="h-4 w-4 text-gold-500" /> Start date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                <Calendar className="h-4 w-4 text-gold-500" /> End date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Tx count + amount range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>
                <Hash className="h-4 w-4 text-gold-500" /> Transactions
              </label>
              <input
                type="number"
                min="4"
                max="500"
                value={form.txCount}
                onChange={(e) => setForm({ ...form, txCount: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                <DollarSign className="h-4 w-4 text-gold-500" /> Min amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.minAmount}
                onChange={(e) =>
                  setForm({ ...form, minAmount: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                <DollarSign className="h-4 w-4 text-gold-500" /> Max amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.maxAmount}
                onChange={(e) =>
                  setForm({ ...form, maxAmount: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Pattern + Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <Settings2 className="h-4 w-4 text-gold-500" /> Pattern
              </label>
              <select
                value={form.pattern}
                onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                className={inputCls}
              >
                {PATTERNS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} — {p.hint}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                <FileText className="h-4 w-4 text-gold-500" /> Mode
              </label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value })}
                className={inputCls}
              >
                <option value="replace">Replace existing history</option>
                <option value="append">Append to existing history</option>
              </select>
            </div>
          </div>

          {/* Primary allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <Wallet className="h-4 w-4 text-gold-500" /> Primary min %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.primaryMinPct}
                onChange={(e) =>
                  setForm({ ...form, primaryMinPct: e.target.value })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                <Wallet className="h-4 w-4 text-gold-500" /> Primary max %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.primaryMaxPct}
                onChange={(e) =>
                  setForm({ ...form, primaryMaxPct: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>

          {/* Projected distribution */}
          {projBal > 0 && (
            <div className="rounded-lg bg-navy-900/40 border border-border-subtle/50 p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Projected distribution (approx.)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gold-500 shrink-0" />
                  <div>
                    <p className="text-text-muted text-xs">USD</p>
                    <p className="text-text-primary font-semibold">
                      {fmt(projPrimary, "USD")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-text-muted text-xs">EUR</p>
                    <p className="text-text-primary font-semibold">
                      {fmt(projEach * 0.92, "EUR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PoundSterling className="h-4 w-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-text-muted text-xs">GBP</p>
                    <p className="text-text-primary font-semibold">
                      {fmt(projEach * 0.79, "GBP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-text-muted text-xs">BTC</p>
                    <p className="text-text-primary font-semibold">
                      {fmt(projEach / 65000, "BTC")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced: custom descriptions */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-medium text-gold-500 hover:text-gold-400 transition-colors"
            >
              {showAdvanced
                ? "▾ Hide custom descriptions"
                : "▸ Custom descriptions (optional)"}
            </button>
            {showAdvanced && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Credit descriptions</label>
                  <textarea
                    value={form.creditDescs}
                    onChange={(e) =>
                      setForm({ ...form, creditDescs: e.target.value })
                    }
                    rows={5}
                    placeholder={"One per line, e.g.:\nSalary deposit\nClient payment\nDividend"}
                    className={inputCls + " resize-none"}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Leave blank for default business descriptions
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Debit descriptions</label>
                  <textarea
                    value={form.debitDescs}
                    onChange={(e) =>
                      setForm({ ...form, debitDescs: e.target.value })
                    }
                    rows={5}
                    placeholder={"One per line, e.g.:\nOffice supplies\nVendor payment\nRent"}
                    className={inputCls + " resize-none"}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Leave blank for default business descriptions
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validation warnings */}
          {projBal < 0 && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              Debit cannot exceed credit.
            </div>
          )}
          {minPct > maxPct && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              Primary min % cannot exceed max %.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="w-full gold-gradient rounded-lg py-3 text-sm font-semibold text-navy-950 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" /> Generate Transactions
              </>
            )}
          </button>
        </form>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
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
              {selectedUser.accountCount} account
              {selectedUser.accountCount === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {result && (
          <div className="glass glass-border rounded-xl p-5 border-success/20 bg-success/5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <h3 className="text-sm font-semibold text-success">
                Generation complete
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Transactions</span>
                <span className="text-text-primary font-semibold">
                  {result.transactionCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Mode</span>
                <span className="text-text-secondary capitalize">
                  {result.mode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Pattern</span>
                <span className="text-text-secondary capitalize">
                  {result.pattern}
                </span>
              </div>
              <div className="flex justify-between border-t border-border-subtle/50 pt-2">
                <span className="text-text-muted">Final USD base</span>
                <span className="gold-text font-semibold">
                  {fmt(result.finalBalanceUsd, "USD")}
                </span>
              </div>
              {result.fxRates && (
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">BTC spot</span>
                  <span className="text-text-secondary">
                    {fmt(result.fxRates.btcUsdSpot, "USD")} (
                    {result.fxRates.btcPriceSource})
                  </span>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Final balances
              </p>
              {[
                { icon: Wallet, color: "text-gold-500", label: "USD", cur: "USD" },
                { icon: Euro, color: "text-blue-400", label: "EUR", cur: "EUR" },
                { icon: PoundSterling, color: "text-purple-400", label: "GBP", cur: "GBP" },
                { icon: Bitcoin, color: "text-orange-400", label: "BTC", cur: "BTC" },
              ].map((row) => {
                const Icon = row.icon;
                const bal = result.accounts[row.cur] ?? 0;
                const share = result.shares[row.cur] ?? 0;
                return (
                  <div
                    key={row.cur}
                    className="flex items-center justify-between rounded-lg bg-navy-900/40 px-3 py-2 border border-border-subtle/40"
                  >
                    <span className="flex items-center gap-2 text-text-secondary text-sm">
                      <Icon className={`h-4 w-4 ${row.color}`} />
                      {row.label}
                      <span className="text-text-muted text-xs">
                        ({share}%)
                      </span>
                    </span>
                    <span className="text-text-primary font-semibold text-sm">
                      {fmt(bal, row.cur)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="glass glass-border rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            How it works
          </h3>
          <ol className="space-y-1.5 text-sm text-text-secondary list-decimal list-inside">
            <li>Select user + enter credit and debit totals</li>
            <li>
              Primary Checking gets{" "}
              <span className="text-gold-500">{form.primaryMinPct}–{form.primaryMaxPct}%</span>
            </li>
            <li>Rest splits randomly across EUR, GBP, BTC</li>
            <li>BTC rate fetched live from CoinGecko</li>
            <li>Transactions spread across the date range by pattern</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
