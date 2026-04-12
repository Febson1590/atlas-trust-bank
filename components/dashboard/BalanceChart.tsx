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
import EmptyState from "@/components/ui/EmptyState";

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
    <div className="rounded-lg bg-navy-800 border border-border-default px-3 py-2 shadow-xl shadow-navy-950/50">
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
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
      <EmptyState
        icon={TrendingUp}
        title="No balance data"
        description="Your balance trend chart will appear here once you have transaction history."
      />
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C5A55A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0A1628" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#5A6B8A" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#5A6B8A" }}
            tickFormatter={(val: number) =>
              val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`
            }
            width={55}
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
              r: 5,
              fill: "#C5A55A",
              stroke: "#0A1628",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
