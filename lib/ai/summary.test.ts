import { describe, it, expect } from "vitest";
import {
  computeStreaks,
  computeTimeOfDay,
  detectRevengeTrading,
  buildStatsSummary,
} from "./summary";
import type { AnalyticsTrade } from "@/lib/analytics/types";

function trade(p: Partial<AnalyticsTrade>): AnalyticsTrade {
  return {
    symbol: "EURUSD",
    side: "BUY",
    openPrice: 1.1,
    closePrice: 1.1,
    stopLoss: null,
    takeProfit: null,
    pnl: 0,
    openTime: "2026-06-01T10:00:00.000Z",
    closeTime: "2026-06-01T11:00:00.000Z",
    strategyTag: null,
    ...p,
  };
}

describe("computeStreaks", () => {
  it("finds longest win/loss and current run", () => {
    const s = computeStreaks([
      trade({ pnl: 10, closeTime: "2026-06-01T11:00:00.000Z" }),
      trade({ pnl: 20, closeTime: "2026-06-01T12:00:00.000Z" }),
      trade({ pnl: -5, closeTime: "2026-06-01T13:00:00.000Z" }),
      trade({ pnl: 15, closeTime: "2026-06-01T14:00:00.000Z" }),
    ]);
    expect(s.longestWin).toBe(2);
    expect(s.longestLoss).toBe(1);
    expect(s.current).toBe(1); // ended on a single win
  });
});

describe("detectRevengeTrading", () => {
  it("flags a trade opened shortly after a losing close", () => {
    const r = detectRevengeTrading([
      trade({
        pnl: -50,
        openTime: "2026-06-01T10:00:00.000Z",
        closeTime: "2026-06-01T10:30:00.000Z",
      }),
      // opens 10 min after the loss closed -> revenge
      trade({
        pnl: 20,
        openTime: "2026-06-01T10:40:00.000Z",
        closeTime: "2026-06-01T11:00:00.000Z",
      }),
      // opens 90 min after the loss closed -> not revenge
      trade({
        pnl: 30,
        openTime: "2026-06-01T12:00:00.000Z",
        closeTime: "2026-06-01T12:30:00.000Z",
      }),
    ]);
    expect(r.rapidReentries).toBe(1);
    expect(r.rapidReentryPnl).toBe(20);
  });

  it("reports zero when there are no rapid re-entries", () => {
    const r = detectRevengeTrading([trade({ pnl: 10 })]);
    expect(r.rapidReentries).toBe(0);
  });
});

describe("computeTimeOfDay", () => {
  it("buckets pnl by the UTC open hour", () => {
    const buckets = computeTimeOfDay([
      trade({ pnl: 10, openTime: "2026-06-01T09:15:00.000Z" }),
      trade({ pnl: 5, openTime: "2026-06-01T09:45:00.000Z" }),
      trade({ pnl: -3, openTime: "2026-06-01T15:00:00.000Z" }),
    ]);
    expect(buckets).toContainEqual({ hourUtc: 9, pnl: 15, trades: 2 });
    expect(buckets).toContainEqual({ hourUtc: 15, pnl: -3, trades: 1 });
  });
});

describe("buildStatsSummary", () => {
  it("assembles totals, expectancy, and period", () => {
    const start = new Date("2026-06-01T00:00:00.000Z");
    const end = new Date("2026-06-08T00:00:00.000Z");
    const summary = buildStatsSummary(
      [
        trade({ pnl: 100 }),
        trade({ pnl: -40 }),
        trade({ pnl: null }), // open trade
      ],
      start,
      end,
    );
    expect(summary.period.days).toBe(7);
    expect(summary.totals.trades).toBe(3);
    expect(summary.totals.closed).toBe(2);
    expect(summary.totals.totalPnl).toBe(60);
    expect(summary.expectancy).toBe(30); // 60 / 2
    expect(summary.profitFactor).toBe(2.5); // 100 / 40
  });
});
