import type { Trade, TradeSide, TradeSource } from "@prisma/client";

/** Result returned by trade server actions. */
export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      code?: "UNAUTHENTICATED" | "VALIDATION" | "LIMIT_REACHED" | "NOT_FOUND";
    };

/** Plain, client-serializable shape of a Trade (dates as ISO strings). */
export type SerializedTrade = {
  id: string;
  symbol: string;
  side: TradeSide;
  volume: number;
  openPrice: number;
  closePrice: number | null;
  openTime: string;
  closeTime: string | null;
  stopLoss: number | null;
  takeProfit: number | null;
  commission: number;
  swap: number;
  pnl: number | null;
  source: TradeSource;
};

export function serializeTrade(trade: Trade): SerializedTrade {
  return {
    id: trade.id,
    symbol: trade.symbol,
    side: trade.side,
    volume: trade.volume,
    openPrice: trade.openPrice,
    closePrice: trade.closePrice,
    openTime: trade.openTime.toISOString(),
    closeTime: trade.closeTime ? trade.closeTime.toISOString() : null,
    stopLoss: trade.stopLoss,
    takeProfit: trade.takeProfit,
    commission: trade.commission,
    swap: trade.swap,
    pnl: trade.pnl,
    source: trade.source,
  };
}
