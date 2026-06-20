export const CHART = {
  accent: "#3b82f6",
  green: "#34d399",
  red: "#f87171",
  grid: "rgba(255,255,255,0.06)",
  axis: "#9a9aae",
};

/** Dark tooltip styling shared across charts. */
export const tooltipStyle = {
  contentStyle: {
    background: "#12121a",
    border: "1px solid #262633",
    borderRadius: 8,
    fontSize: 12,
    color: "#e7e7ee",
  },
  labelStyle: { color: "#9a9aae" },
  itemStyle: { color: "#e7e7ee" },
};

export function formatAxisDate(t: number): string {
  return new Date(t).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatAxisCurrency(value: number): string {
  const abs = Math.abs(value);
  const compact =
    abs >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`;
  return `$${compact}`;
}
