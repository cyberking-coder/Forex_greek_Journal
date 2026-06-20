"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EquityPoint } from "@/lib/analytics/types";
import { formatSignedCurrency } from "@/lib/format";
import {
  CHART,
  formatAxisCurrency,
  formatAxisDate,
  tooltipStyle,
} from "./chartTheme";

export function EquityChart({ data }: { data: EquityPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.accent} stopOpacity={0.4} />
            <stop offset="100%" stopColor={CHART.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="t"
          type="number"
          scale="time"
          domain={["dataMin", "dataMax"]}
          tickFormatter={formatAxisDate}
          stroke={CHART.axis}
          fontSize={12}
          tickLine={false}
          minTickGap={32}
        />
        <YAxis
          tickFormatter={formatAxisCurrency}
          stroke={CHART.axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <Tooltip
          {...tooltipStyle}
          labelFormatter={(t) => new Date(Number(t)).toLocaleString()}
          formatter={(value: unknown) => [
            formatSignedCurrency(Number(value)),
            "Equity",
          ]}
        />
        <Area
          type="monotone"
          dataKey="equity"
          stroke={CHART.accent}
          strokeWidth={2}
          fill="url(#equityFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
