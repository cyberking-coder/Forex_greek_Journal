import { describe, it, expect } from "vitest";
import {
  computeSummary,
  computeEquityCurve,
  computeDrawdown,
  computeDailyPnl,
  sessionForHourUtc,
  breakdownBySymbol,
  breakdownBySession,
  breakdownByTag,
} from "./metrics";
import type { AnalyticsTrade } from "./types";

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
    closeTime: "2026-06-01T12:00:00.000Z",
    strategyTag: null,
    ...p,
  };
}

describe("computeSummary", () => {
  it("computes pnl, win rate, and profit factor over closed trades", () => {
    const trades = [
      trade({ pnl: 100 }),
      trade({ pnl: -40 }),
      trade({ pnl: 60 }),
      trade({ pnl: null }), // open trade ignored for closed metrics
    ];
    const s = computeSummary(trades);
    expect(s.totalTrades).toBe(4);
    expect(s.closedTrades).toBe(3);
    expect(s.wins).toBe(2);
    expect(s.losses).toBe(1);
    expect(s.totalPnl).toBe(120);
    expect(s.grossProfit).toBe(160);
    expect(s.grossLoss).toBe(40);
    expect(s.profitFactor).toBe(4); // 160 / 40
    expect(s.winRate).toBeCloseTo(2 / 3, 5);
  });

  it("returns null profit factor when there are no losses", () => {
    const s = computeSummary([trade({ pnl: 50 }), trade({ pnl: 10 })]);
    expect(s.profitFactor).toBeNull();
  });

  it("averages planned reward:risk from SL/TP", () => {
    // risk=0.1 reward=0.2 -> 2 ; risk=0.05 reward=0.05 -> 1 ; avg = 1.5
    const trades = [
      trade({ openPrice: 1.0, stopLoss: 0.9, takeProfit: 1.2 }),
      trade({ openPrice: 1.0, stopLoss: 0.95, takeProfit: 1.05 }),
      trade({ openPrice: 1.0, stopLoss: null, takeProfit: 1.2 }), // skipped
    ];
    expect(computeSummary(trades).avgRR).toBe(1.5);
  });

  it("handles the empty case", () => {
    const s = computeSummary([]);
    expect(s).toMatchObject({
      totalPnl: 0,
      totalTrades: 0,
      winRate: 0,
      profitFactor: null,
      avgRR: null,
    });
  });
});

describe("equity curve and drawdown", () => {
  it("accumulates pnl in chronological order", () => {
    const trades = [
      trade({ pnl: 50, closeTime: "2026-06-03T12:00:00.000Z" }),
      trade({ pnl: -30, closeTime: "2026-06-01T12:00:00.000Z" }),
      trade({ pnl: 20, closeTime: "2026-06-02T12:00:00.000Z" }),
    ];
    const eq = computeEquityCurve(trades);
    expect(eq.map((p) => p.equity)).toEqual([-30, -10, 40]);
  });

  it("computes drawdown from the running peak", () => {
    const eq = computeEquityCurve([
      trade({ pnl: 100, closeTime: "2026-06-01T12:00:00.000Z" }),
      trade({ pnl: -60, closeTime: "2026-06-02T12:00:00.000Z" }),
      trade({ pnl: -10, closeTime: "2026-06-03T12:00:00.000Z" }),
    ]);
    const dd = computeDrawdown(eq);
    expect(dd.map((p) => p.drawdown)).toEqual([0, -60, -70]);
  });
});

describe("computeDailyPnl", () => {
  it("sums pnl per UTC day", () => {
    const daily = computeDailyPnl([
      trade({ pnl: 10, closeTime: "2026-06-01T09:00:00.000Z" }),
      trade({ pnl: 15, closeTime: "2026-06-01T20:00:00.000Z" }),
      trade({ pnl: -5, closeTime: "2026-06-02T11:00:00.000Z" }),
    ]);
    expect(daily).toEqual([
      { date: "2026-06-01", pnl: 25 },
      { date: "2026-06-02", pnl: -5 },
    ]);
  });
});

describe("sessionForHourUtc", () => {
  it("maps UTC hours to sessions", () => {
    expect(sessionForHourUtc(2)).toBe("Asian");
    expect(sessionForHourUtc(9)).toBe("London");
    expect(sessionForHourUtc(15)).toBe("New York");
    expect(sessionForHourUtc(23)).toBe("Asian");
  });
});

describe("breakdowns", () => {
  const trades = [
    trade({
      symbol: "EURUSD",
      pnl: 100,
      strategyTag: "Breakout",
      openTime: "2026-06-01T09:00:00.000Z",
    }),
    trade({
      symbol: "GBPUSD",
      pnl: -50,
      strategyTag: null,
      openTime: "2026-06-01T15:00:00.000Z",
    }),
    trade({
      symbol: "EURUSD",
      pnl: 25,
      strategyTag: "Breakout",
      openTime: "2026-06-01T02:00:00.000Z",
    }),
  ];

  it("groups by symbol and sorts by pnl", () => {
    expect(breakdownBySymbol(trades)).toEqual([
      { key: "EURUSD", pnl: 125, trades: 2 },
      { key: "GBPUSD", pnl: -50, trades: 1 },
    ]);
  });

  it("groups by session via openTime UTC hour", () => {
    const bySession = breakdownBySession(trades);
    expect(bySession).toContainEqual({ key: "London", pnl: 100, trades: 1 });
    expect(bySession).toContainEqual({ key: "New York", pnl: -50, trades: 1 });
    expect(bySession).toContainEqual({ key: "Asian", pnl: 25, trades: 1 });
  });

  it("groups by strategy tag, defaulting to Untagged", () => {
    expect(breakdownByTag(trades)).toEqual([
      { key: "Breakout", pnl: 125, trades: 2 },
      { key: "Untagged", pnl: -50, trades: 1 },
    ]);
  });
});
