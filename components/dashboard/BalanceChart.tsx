"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, ChevronDown } from "lucide-react";

interface BalanceDataPoint {
  /** Formatted label shown on the X-axis tick + tooltip. */
  date: string;
  /** ISO timestamp — used to filter by date window, never shown. */
  iso: string;
  /** Running total balance at this point. */
  balance: number;
}

interface BalanceChartProps {
  data: BalanceDataPoint[];
  /**
   * Current live total balance (same number as the "Total Balance" card).
   * We append a synthetic "today" data point with this value so the
   * chart's right edge always reflects reality — otherwise a user with
   * no transactions in the last N days would see an empty or stale chart.
   */
  currentBalance: number;
}

// Range options exposed in the dropdown. `7` is the default because the
// most common dashboard use-case is "what did the last week look like?"
// 360 stops short of 365 so the label reads round without implying we
// cover a full calendar year (which would need 366 in a leap year).
const RANGE_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 60, label: "Last 60 days" },
  { value: 120, label: "Last 120 days" },
  { value: 360, label: "Last 360 days" },
] as const;
type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-navy-900 border border-border-default px-3 py-2 shadow-xl shadow-navy-950/50">
      <p className="text-[10px] text-text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-text-primary">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(payload[0].value)}
      </p>
    </div>
  );
}

function formatTodayLabel(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function BalanceChart({
  data,
  currentBalance,
}: BalanceChartProps) {
  const [range, setRange] = useState<RangeValue>(7);
  const [menuOpen, setMenuOpen] = useState(false);

  // Filter the incoming data to the selected window, plus:
  //   - a synthetic "start" point anchored at the balance as of the
  //     cutoff date (inferred from the LAST known balance before the
  //     window starts; 0 if there's no history at all). Without this,
  //     a user with no transactions in the last 7 days would see an
  //     empty chart even though their balance is clearly non-zero.
  //   - a synthetic "today" point so the line always reaches the right
  //     edge at the real current balance.
  const filtered = useMemo<BalanceDataPoint[]>(() => {
    const now = Date.now();
    const cutoff = now - range * 24 * 60 * 60 * 1000;

    // Split the history at the cutoff.
    const before: BalanceDataPoint[] = [];
    const inRange: BalanceDataPoint[] = [];
    for (const p of data) {
      const t = new Date(p.iso).getTime();
      if (t < cutoff) before.push(p);
      else inRange.push(p);
    }

    const startBalance = before.length
      ? before[before.length - 1].balance
      : inRange.length
      ? inRange[0].balance
      : currentBalance;

    const cutoffDate = new Date(cutoff);
    const startPoint: BalanceDataPoint = {
      iso: cutoffDate.toISOString(),
      date: cutoffDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      balance: startBalance,
    };

    const todayPoint: BalanceDataPoint = {
      iso: new Date().toISOString(),
      date: formatTodayLabel(),
      balance: currentBalance,
    };

    // Dedupe: if the first/last in-range point already lands on the
    // same day as our synthetic anchors, drop the synthetics so we
    // don't draw two dots on the same X-axis tick.
    const points = [...inRange];
    if (!points.length || points[0].date !== startPoint.date) {
      points.unshift(startPoint);
    }
    if (points[points.length - 1].date !== todayPoint.date) {
      points.push(todayPoint);
    } else {
      // Same day — use the live balance (more accurate than the last
      // tx's stale balance_after).
      points[points.length - 1] = todayPoint;
    }
    return points;
  }, [data, range, currentBalance]);

  // Completely empty state: no transactions, no accounts, no balance.
  if (!data.length && currentBalance === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-700 border border-border-subtle mb-3">
          <TrendingUp className="h-5 w-5 text-text-muted" />
        </div>
        <p className="text-sm font-medium text-text-secondary">
          No activity yet
        </p>
        <p className="text-xs text-text-muted mt-1 max-w-xs">
          Your balance changes will appear here as you make transactions.
        </p>
      </div>
    );
  }

  const activeLabel =
    RANGE_OPTIONS.find((o) => o.value === range)?.label || "Last 7 days";

  return (
    <div>
      {/* Header with range selector */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Balance Over Time
        </p>

        {/* Range dropdown — small on purpose so it doesn't dominate the
            header. Closes on outside click because we stop propagation
            and use a transparent full-screen layer under the panel. */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            className="flex items-center gap-1.5 rounded-md border border-border-default bg-navy-800/60 px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:text-text-primary hover:border-gold-500/30 transition-colors"
          >
            {activeLabel}
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="listbox"
                className="absolute right-0 top-full mt-1 z-40 w-40 rounded-lg bg-navy-800 border border-border-default shadow-xl overflow-hidden"
              >
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={opt.value === range}
                    onClick={() => {
                      setRange(opt.value);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      opt.value === range
                        ? "bg-gold-500/10 text-gold-400"
                        : "text-text-secondary hover:bg-navy-700 hover:text-text-primary"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[240px] sm:h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filtered}
            margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C5A55A" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0A1628" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#4d5f7e" }}
              dy={8}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#4d5f7e" }}
              tickFormatter={(val: number) =>
                val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`
              }
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#C5A55A"
              strokeWidth={2}
              fill="url(#balanceGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#C5A55A",
                stroke: "#0c1829",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
