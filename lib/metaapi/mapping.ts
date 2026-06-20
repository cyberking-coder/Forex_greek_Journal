import type { TradeSide } from "@prisma/client";
import type { RawDeal } from "./types";

export type MappedTrade = {
  externalId: string;
  symbol: string;
  side: TradeSide;
  volume: number;
  openPrice: number;
  closePrice: number | null;
  openTime: Date;
  closeTime: Date | null;
  commission: number;
  swap: number;
  pnl: number | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const sum = (deals: RawDeal[], pick: (d: RawDeal) => number | undefined) =>
  deals.reduce((acc, d) => acc + (pick(d) ?? 0), 0);

/**
 * Reconstructs position-level trades from broker deals.
 *
 * A position is opened by an entry-IN deal and closed by entry-OUT deal(s).
 * Deals are grouped by positionId, which becomes the trade's externalId so
 * re-syncs upsert the same row (dedupe). Balance/credit deals are ignored.
 * PnL is net of commission and swap; open positions have a null close/pnl.
 */
export function mapDealsToTrades(deals: RawDeal[]): MappedTrade[] {
  const groups = new Map<string, RawDeal[]>();
  for (const d of deals) {
    if (!d.positionId || !d.symbol) continue;
    if (d.type !== "DEAL_TYPE_BUY" && d.type !== "DEAL_TYPE_SELL") continue;
    const arr = groups.get(d.positionId) ?? [];
    arr.push(d);
    groups.set(d.positionId, arr);
  }

  const trades: MappedTrade[] = [];
  for (const [positionId, group] of groups) {
    const sorted = [...group].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );
    const inDeal =
      sorted.find(
        (d) => (d.entryType ?? "DEAL_ENTRY_IN") === "DEAL_ENTRY_IN",
      ) ?? sorted[0]!;
    const outDeals = sorted.filter(
      (d) =>
        d !== inDeal &&
        (d.entryType === "DEAL_ENTRY_OUT" ||
          d.entryType === "DEAL_ENTRY_INOUT"),
    );
    const lastOut = outDeals[outDeals.length - 1];
    const closed = Boolean(lastOut);

    const commission = sum(sorted, (d) => d.commission);
    const swap = sum(sorted, (d) => d.swap);
    const profit = sum(sorted, (d) => d.profit);

    trades.push({
      externalId: positionId,
      symbol: inDeal.symbol!,
      // Position side is the side of the opening deal.
      side: inDeal.type === "DEAL_TYPE_BUY" ? "BUY" : "SELL",
      volume: inDeal.volume ?? 0,
      openPrice: inDeal.price ?? 0,
      closePrice: closed ? (lastOut!.price ?? null) : null,
      openTime: new Date(inDeal.time),
      closeTime: closed ? new Date(lastOut!.time) : null,
      commission: round2(commission),
      swap: round2(swap),
      pnl: closed ? round2(profit + commission + swap) : null,
    });
  }

  return trades;
}
