"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface BalanceDataPoint {
  date: string;
  balance: number;
}

interface BalanceChartProps {
  data: BalanceDataPoint[];
}

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

export default function BalanceChart({ data }: BalanceChartProps) {
  if (!data.length) {
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Balance Over Time
        </p>
        <span className="text-[10px] text-text-muted px-2 py-0.5 rounded bg-navy-700/50">
          Last {data.length} {data.length === 1 ? "day" : "days"}
        </span>
      </div>

      {/* Chart */}
      <div className="h-[240px] sm:h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
