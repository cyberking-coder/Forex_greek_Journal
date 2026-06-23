export type LeaderboardPeriod = "daily" | "weekly" | "monthly";
export type LeaderboardMetric = "pnl" | "winRate";

export type LeaderboardEntry = {
  userId: string;
  name: string;
  pnl: number;
  winRate: number; // 0..1
  trades: number;
  wins: number;
};

export type RankedEntry = LeaderboardEntry & { rank: number };

/** Start of the ranking window for a period (rolling for week/month, calendar day for daily). */
export function periodStartFor(
  period: LeaderboardPeriod,
  now: Date = new Date(),
): Date {
  if (period === "daily") {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }
  const days = period === "weekly" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Summarize a user's closed-trade PnLs into a leaderboard entry. */
export function summarizeUser(
  userId: string,
  name: string,
  pnls: number[],
): LeaderboardEntry {
  const wins = pnls.filter((p) => p > 0).length;
  const pnl = round2(pnls.reduce((a, b) => a + b, 0));
  return {
    userId,
    name,
    pnl,
    winRate: pnls.length > 0 ? wins / pnls.length : 0,
    trades: pnls.length,
    wins,
  };
}

/** Ranks entries by the chosen metric (PnL desc, or win rate desc with PnL tie-break). */
export function rankEntries(
  entries: LeaderboardEntry[],
  metric: LeaderboardMetric,
): RankedEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (metric === "winRate") {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.pnl - a.pnl;
    }
    if (b.pnl !== a.pnl) return b.pnl - a.pnl;
    return b.winRate - a.winRate;
  });
  return sorted.map((entry, i) => ({ ...entry, rank: i + 1 }));
}
