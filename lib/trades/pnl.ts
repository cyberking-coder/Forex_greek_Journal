import type { TradeSide } from "@prisma/client";

/**
 * Simplified PnL calculation.
 *
 * NOTE: This is intentionally simplified. A correct figure must account for the
 * instrument's contract/lot size, tick value, and conversion into the account's
 * currency — none of which we have for a manually entered trade. Until MT5 sync
 * provides the broker-calculated profit, we approximate the gross result as the
 * favorable price move times volume, then net out commission and swap (both
 * treated as positive costs entered by the user).
 */
export function calculatePnl(params: {
  side: TradeSide;
  volume: number;
  openPrice: number;
  closePrice: number;
  commission?: number;
  swap?: number;
}): number {
  const {
    side,
    volume,
    openPrice,
    closePrice,
    commission = 0,
    swap = 0,
  } = params;
  const direction = side === "BUY" ? 1 : -1;
  const gross = (closePrice - openPrice) * direction * volume;
  const net = gross - commission - swap;
  // Round to cents to avoid floating-point noise.
  return Math.round(net * 100) / 100;
}
