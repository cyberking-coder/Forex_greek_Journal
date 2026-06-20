export type AnalyticsTrade = {
  symbol: string;
  side: "BUY" | "SELL";
  openPrice: number;
  closePrice: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  pnl: number | null;
  openTime: string; // ISO (UTC)
  closeTime: string | null; // ISO (UTC)
  strategyTag: string | null;
};

export type Summary = {
  totalPnl: number;
  totalTrades: number;
  closedTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  /** 0..1 over closed trades. */
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  /** grossProfit / grossLoss; null when there are no losses. */
  profitFactor: number | null;
  /** Average planned reward:risk from TP/SL; null when none have both. */
  avgRR: number | null;
};

export type EquityPoint = { t: number; equity: number };
export type DrawdownPoint = { t: number; drawdown: number };
export type DailyPnl = { date: string; pnl: number };
export type Breakdown = { key: string; pnl: number; trades: number };
export type SessionName = "Asian" | "London" | "New York";
