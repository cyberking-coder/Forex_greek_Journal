import { prisma } from "@/lib/db";
import {
  periodStartFor,
  rankEntries,
  summarizeUser,
  type LeaderboardMetric,
  type LeaderboardPeriod,
  type RankedEntry,
} from "@/lib/leaderboard/ranking";

/** Public display name for a ranked user — never leaks the email. */
function publicName(user: {
  id: string;
  displayName: string | null;
  name: string | null;
}): string {
  return user.displayName || user.name || `Trader ${user.id.slice(-4)}`;
}

/**
 * Builds the ranked leaderboard for a period/metric over opted-in users with
 * closed trades in the window.
 */
export async function getLeaderboard(
  period: LeaderboardPeriod,
  metric: LeaderboardMetric,
): Promise<RankedEntry[]> {
  const start = periodStartFor(period);

  const users = await prisma.user.findMany({
    where: { leaderboardOptIn: true },
    select: { id: true, displayName: true, name: true },
  });
  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);
  const trades = await prisma.trade.findMany({
    where: {
      userId: { in: userIds },
      pnl: { not: null },
      openTime: { gte: start },
    },
    select: { userId: true, pnl: true },
  });

  const pnlsByUser = new Map<string, number[]>();
  for (const t of trades) {
    if (t.pnl === null) continue;
    const arr = pnlsByUser.get(t.userId) ?? [];
    arr.push(t.pnl);
    pnlsByUser.set(t.userId, arr);
  }

  const entries = users
    .filter((u) => pnlsByUser.has(u.id))
    .map((u) => summarizeUser(u.id, publicName(u), pnlsByUser.get(u.id)!));

  return rankEntries(entries, metric);
}
