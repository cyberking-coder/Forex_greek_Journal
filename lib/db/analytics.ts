import { prisma } from "@/lib/db";
import type { AnalyticsTrade } from "@/lib/analytics/types";

/** Fetch all of a user's trades, shaped for the analytics functions. */
export async function getTradesForAnalytics(
  userId: string,
): Promise<AnalyticsTrade[]> {
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { openTime: "asc" },
    include: { journalEntry: { select: { strategyTag: true } } },
  });

  return trades.map((t) => ({
    symbol: t.symbol,
    side: t.side,
    openPrice: t.openPrice,
    closePrice: t.closePrice,
    stopLoss: t.stopLoss,
    takeProfit: t.takeProfit,
    pnl: t.pnl,
    openTime: t.openTime.toISOString(),
    closeTime: t.closeTime ? t.closeTime.toISOString() : null,
    strategyTag: t.journalEntry?.strategyTag ?? null,
  }));
}
