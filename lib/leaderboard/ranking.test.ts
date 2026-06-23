import { describe, it, expect } from "vitest";
import {
  rankEntries,
  summarizeUser,
  periodStartFor,
  type LeaderboardEntry,
} from "./ranking";

const entries: LeaderboardEntry[] = [
  { userId: "a", name: "A", pnl: 100, winRate: 0.5, trades: 10, wins: 5 },
  { userId: "b", name: "B", pnl: 300, winRate: 0.4, trades: 10, wins: 4 },
  { userId: "c", name: "C", pnl: 50, winRate: 0.9, trades: 10, wins: 9 },
];

describe("rankEntries", () => {
  it("ranks by PnL descending", () => {
    const r = rankEntries(entries, "pnl");
    expect(r.map((e) => e.userId)).toEqual(["b", "a", "c"]);
    expect(r[0]!.rank).toBe(1);
  });

  it("ranks by win rate descending (PnL tie-break)", () => {
    const r = rankEntries(entries, "winRate");
    expect(r.map((e) => e.userId)).toEqual(["c", "a", "b"]);
  });

  it("does not mutate the input", () => {
    const copy = [...entries];
    rankEntries(entries, "pnl");
    expect(entries).toEqual(copy);
  });
});

describe("summarizeUser", () => {
  it("computes pnl, wins, and win rate", () => {
    const e = summarizeUser("u", "U", [100, -40, 60, -10]);
    expect(e.pnl).toBe(110);
    expect(e.wins).toBe(2);
    expect(e.trades).toBe(4);
    expect(e.winRate).toBe(0.5);
  });
});

describe("periodStartFor", () => {
  const now = new Date("2026-06-15T14:30:00.000Z");
  it("daily starts at UTC midnight", () => {
    expect(periodStartFor("daily", now).toISOString()).toBe(
      "2026-06-15T00:00:00.000Z",
    );
  });
  it("weekly is 7 days back", () => {
    expect(periodStartFor("weekly", now).toISOString()).toBe(
      "2026-06-08T14:30:00.000Z",
    );
  });
  it("monthly is 30 days back", () => {
    expect(periodStartFor("monthly", now).toISOString()).toBe(
      "2026-05-16T14:30:00.000Z",
    );
  });
});
