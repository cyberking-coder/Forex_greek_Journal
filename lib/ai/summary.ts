import type { AnalyticsTrade, Breakdown } from "@/lib/analytics/types";
import {
  computeSummary,
  computeEquityCurve,
  computeDrawdown,
  breakdownBySymbol,
  breakdownBySession,
  breakdownByTag,
} from "@/lib/analytics/metrics";

/** Minutes within which a new trade after a loss counts as a "revenge" re-entry. */
export const REVENGE_THRESHOLD_MINUTES = 15;
const TOP_N = 8;

type ClosedTrade = AnalyticsTrade & { pnl: number };
const isClosed = (t: AnalyticsTrade): t is ClosedTrade => t.pnl !== null;
const round2 = (n: number) => Math.round(n * 100) / 100;

export type Streaks = {
  longestWin: number;
  longestLoss: number;
  /** Signed: positive = current win streak, negative = current loss streak. */
  current: number;
};

export type HourBucket = { hourUtc: number; pnl: number; trades: number };

export type RevengeSignal = {
  thresholdMinutes: number;
  rapidReentries: number;
  rapidReentryPnl: number;
  note: string;
};

export type AiStatsSummary = {
  period: { start: string; end: string; days: number };
  totals: {
    trades: number;
    closed: number;
    open: number;
    totalPnl: number;
    grossProfit: number;
    grossLoss: number;
  };
  winRate: number;
  profitFactor: number | null;
  avgRR: number | null;
  expectancy: number;
  avgWin: number;
  avgLoss: number;
  streaks: Streaks;
  maxDrawdown: number;
  bySymbol: Breakdown[];
  bySession: Breakdown[];
  byTag: Breakdown[];
  timeOfDay: HourBucket[];
  revengeTrading: RevengeSignal;
};

/** Longest win/loss streaks and the current run, over closed trades by close time. */
export function computeStreaks(trades: AnalyticsTrade[]): Streaks {
  const closed = trades
    .filter(isClosed)
    .sort(
      (a, b) =>
        new Date(a.closeTime ?? a.openTime).getTime() -
        new Date(b.closeTime ?? b.openTime).getTime(),
    );

  let longestWin = 0;
  let longestLoss = 0;
  let run = 0; // signed
  for (const t of closed) {
    const sign = t.pnl > 0 ? 1 : t.pnl < 0 ? -1 : 0;
    if (sign === 0) {
      run = 0;
      continue;
    }
    run = run !== 0 && Math.sign(run) === sign ? run + sign : sign;
    if (run > longestWin) longestWin = run;
    if (-run > longestLoss) longestLoss = -run;
  }
  return { longestWin, longestLoss, current: run };
}

/** PnL and trade counts grouped by the UTC hour the trade was opened. */
export function computeTimeOfDay(trades: AnalyticsTrade[]): HourBucket[] {
  const byHour = new Map<number, { pnl: number; trades: number }>();
  for (const t of trades) {
    if (!isClosed(t)) continue;
    const hour = new Date(t.openTime).getUTCHours();
    const cur = byHour.get(hour) ?? { pnl: 0, trades: 0 };
    cur.pnl = round2(cur.pnl + t.pnl);
    cur.trades++;
    byHour.set(hour, cur);
  }
  return Array.from(byHour, ([hourUtc, v]) => ({ hourUtc, ...v })).sort(
    (a, b) => a.hourUtc - b.hourUtc,
  );
}

/**
 * Detects rapid re-entries after a loss: a trade opened within
 * REVENGE_THRESHOLD_MINUTES of the most recent losing trade's close.
 */
export function detectRevengeTrading(trades: AnalyticsTrade[]): RevengeSignal {
  const closed = trades
    .filter(isClosed)
    .sort(
      (a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime(),
    );
  const thresholdMs = REVENGE_THRESHOLD_MINUTES * 60 * 1000;

  let rapidReentries = 0;
  let rapidReentryPnl = 0;
  for (const trade of closed) {
    const openMs = new Date(trade.openTime).getTime();
    // Most recent loss that closed at or before this trade opened.
    let lastLossClose = -Infinity;
    for (const other of closed) {
      if (other === trade || other.pnl >= 0 || !other.closeTime) continue;
      const closeMs = new Date(other.closeTime).getTime();
      if (closeMs <= openMs && closeMs > lastLossClose) lastLossClose = closeMs;
    }
    if (lastLossClose !== -Infinity && openMs - lastLossClose <= thresholdMs) {
      rapidReentries++;
      rapidReentryPnl = round2(rapidReentryPnl + trade.pnl);
    }
  }

  const note =
    rapidReentries === 0
      ? "No rapid re-entries after losses detected."
      : `${rapidReentries} trade(s) opened within ${REVENGE_THRESHOLD_MINUTES} minutes of a losing close (net ${rapidReentryPnl}).`;

  return {
    thresholdMinutes: REVENGE_THRESHOLD_MINUTES,
    rapidReentries,
    rapidReentryPnl,
    note,
  };
}

/** Builds the compact summary sent to the model (never the raw trades). */
export function buildStatsSummary(
  trades: AnalyticsTrade[],
  periodStart: Date,
  periodEnd: Date,
): AiStatsSummary {
  const s = computeSummary(trades);
  const drawdown = computeDrawdown(computeEquityCurve(trades));
  const maxDrawdown = drawdown.reduce((min, p) => Math.min(min, p.drawdown), 0);

  const days = Math.max(
    1,
    Math.round(
      (periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000),
    ),
  );
  const expectancy =
    s.closedTrades > 0 ? round2(s.totalPnl / s.closedTrades) : 0;
  const avgWin = s.wins > 0 ? round2(s.grossProfit / s.wins) : 0;
  const avgLoss = s.losses > 0 ? round2(s.grossLoss / s.losses) : 0;

  return {
    period: {
      start: periodStart.toISOString().slice(0, 10),
      end: periodEnd.toISOString().slice(0, 10),
      days,
    },
    totals: {
      trades: s.totalTrades,
      closed: s.closedTrades,
      open: s.totalTrades - s.closedTrades,
      totalPnl: s.totalPnl,
      grossProfit: s.grossProfit,
      grossLoss: s.grossLoss,
    },
    winRate: round2(s.winRate),
    profitFactor: s.profitFactor,
    avgRR: s.avgRR,
    expectancy,
    avgWin,
    avgLoss,
    streaks: computeStreaks(trades),
    maxDrawdown,
    bySymbol: breakdownBySymbol(trades).slice(0, TOP_N),
    bySession: breakdownBySession(trades),
    byTag: breakdownByTag(trades).slice(0, TOP_N),
    timeOfDay: computeTimeOfDay(trades),
    revengeTrading: detectRevengeTrading(trades),
  };
}
