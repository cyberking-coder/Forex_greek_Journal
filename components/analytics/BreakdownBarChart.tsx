"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Breakdown } from "@/lib/analytics/types";
import { formatSignedCurrency } from "@/lib/format";
import { CHART, formatAxisCurrency, tooltipStyle } from "./chartTheme";

export function BreakdownBarChart({ data }: { data: Breakdown[] }) {
  const height = Math.max(120, data.length * 44 + 16);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, bottom: 4, left: 8 }}
      >
        <XAxis
          type="number"
          tickFormatter={formatAxisCurrency}
          stroke={CHART.axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="key"
          stroke={CHART.axis}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={96}
        />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(value: unknown) => [
            formatSignedCurrency(Number(value)),
            "PnL",
          ]}
        />
        <Bar dataKey="pnl" radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {data.map((d) => (
            <Cell key={d.key} fill={d.pnl >= 0 ? CHART.green : CHART.red} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
