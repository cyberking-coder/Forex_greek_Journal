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
import type { DrawdownPoint } from "@/lib/analytics/types";
import { formatSignedCurrency } from "@/lib/format";
import {
  CHART,
  formatAxisCurrency,
  formatAxisDate,
  tooltipStyle,
} from "./chartTheme";

export function DrawdownChart({ data }: { data: DrawdownPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="ddFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.red} stopOpacity={0.05} />
            <stop offset="100%" stopColor={CHART.red} stopOpacity={0.4} />
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
            "Drawdown",
          ]}
        />
        <Area
          type="monotone"
          dataKey="drawdown"
          stroke={CHART.red}
          strokeWidth={2}
          fill="url(#ddFill)"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
