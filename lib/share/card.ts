import { computeSummary } from "@/lib/analytics/metrics";
import type { AnalyticsTrade } from "@/lib/analytics/types";

export type ShareFormat = "story" | "post" | "landscape";

export const FORMAT_SIZE: Record<
  ShareFormat,
  { width: number; height: number }
> = {
  story: { width: 1080, height: 1920 },
  post: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 630 },
};

export function parseFormat(value: string | null | undefined): ShareFormat {
  return value === "story" || value === "landscape" ? value : "post";
}

export type CardStats = {
  name: string;
  totalPnl: number;
  winRate: number; // 0..1
  profitFactor: number | null;
  trades: number;
};

export function buildCardStats(
  name: string,
  trades: AnalyticsTrade[],
): CardStats {
  const s = computeSummary(trades);
  return {
    name,
    totalPnl: s.totalPnl,
    winRate: s.winRate,
    profitFactor: s.profitFactor,
    trades: s.closedTrades,
  };
}
