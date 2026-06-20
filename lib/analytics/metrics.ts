import type {
  AnalyticsTrade,
  Breakdown,
  DailyPnl,
  DrawdownPoint,
  EquityPoint,
  SessionName,
  Summary,
} from "./types";

type ClosedTrade = AnalyticsTrade & { pnl: number };

const isClosed = (t: AnalyticsTrade): t is ClosedTrade => t.pnl !== null;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeSummary(trades: AnalyticsTrade[]): Summary {
  const closed = trades.filter(isClosed);

  let grossProfit = 0;
  let grossLoss = 0;
  let wins = 0;
  let losses = 0;
  let breakeven = 0;

  for (const t of closed) {
    if (t.pnl > 0) {
      grossProfit += t.pnl;
      wins++;
    } else if (t.pnl < 0) {
      grossLoss += -t.pnl;
      losses++;
    } else {
      breakeven++;
    }
  }

  // Average planned reward:risk derived from stop-loss / take-profit.
  let rrSum = 0;
  let rrCount = 0;
  for (const t of trades) {
    if (t.stopLoss !== null && t.takeProfit !== null) {
      const risk = Math.abs(t.openPrice - t.stopLoss);
      const reward = Math.abs(t.takeProfit - t.openPrice);
      if (risk > 0) {
        rrSum += reward / risk;
        rrCount++;
      }
    }
  }

  return {
    totalPnl: round2(grossProfit - grossLoss),
    totalTrades: trades.length,
    closedTrades: closed.length,
    wins,
    losses,
    breakeven,
    winRate: closed.length > 0 ? wins / closed.length : 0,
    grossProfit: round2(grossProfit),
    grossLoss: round2(grossLoss),
    profitFactor: grossLoss > 0 ? round2(grossProfit / grossLoss) : null,
    avgRR: rrCount > 0 ? round2(rrSum / rrCount) : null,
  };
}

/** Cumulative realized PnL over time (closed trades, ordered by close time). */
export function computeEquityCurve(trades: AnalyticsTrade[]): EquityPoint[] {
  const points = trades
    .filter(isClosed)
    .map((t) => ({
      t: new Date(t.closeTime ?? t.openTime).getTime(),
      pnl: t.pnl,
    }))
    .sort((a, b) => a.t - b.t);

  let cumulative = 0;
  return points.map((p) => {
    cumulative = round2(cumulative + p.pnl);
    return { t: p.t, equity: cumulative };
  });
}

/** Drawdown (equity minus running peak; <= 0) for each equity point. */
export function computeDrawdown(equity: EquityPoint[]): DrawdownPoint[] {
  let peak = 0;
  return equity.map((p) => {
    peak = Math.max(peak, p.equity);
    return { t: p.t, drawdown: round2(p.equity - peak) };
  });
}

/** PnL summed per UTC calendar day. */
export function computeDailyPnl(trades: AnalyticsTrade[]): DailyPnl[] {
  const byDay = new Map<string, number>();
  for (const t of trades.filter(isClosed)) {
    const day = (t.closeTime ?? t.openTime).slice(0, 10); // ISO date is UTC
    byDay.set(day, round2((byDay.get(day) ?? 0) + t.pnl));
  }
  return Array.from(byDay, ([date, pnl]) => ({ date, pnl })).sort((a, b) =>
    a.date < b.date ? -1 : 1,
  );
}

/** Trading session for a UTC hour. Buckets cover all 24h, three named sessions. */
export function sessionForHourUtc(hour: number): SessionName {
  if (hour >= 8 && hour < 13) return "London";
  if (hour >= 13 && hour < 22) return "New York";
  return "Asian";
}

function groupPnl(
  trades: AnalyticsTrade[],
  keyOf: (t: ClosedTrade) => string,
): Breakdown[] {
  const map = new Map<string, { pnl: number; trades: number }>();
  for (const t of trades) {
    if (!isClosed(t)) continue;
    const key = keyOf(t);
    const cur = map.get(key) ?? { pnl: 0, trades: 0 };
    cur.pnl = round2(cur.pnl + t.pnl);
    cur.trades++;
    map.set(key, cur);
  }
  return Array.from(map, ([key, v]) => ({
    key,
    pnl: v.pnl,
    trades: v.trades,
  })).sort((a, b) => b.pnl - a.pnl);
}

export function breakdownBySymbol(trades: AnalyticsTrade[]): Breakdown[] {
  return groupPnl(trades, (t) => t.symbol);
}

export function breakdownByTag(trades: AnalyticsTrade[]): Breakdown[] {
  return groupPnl(trades, (t) => t.strategyTag ?? "Untagged");
}

export function breakdownBySession(trades: AnalyticsTrade[]): Breakdown[] {
  return groupPnl(trades, (t) =>
    sessionForHourUtc(new Date(t.openTime).getUTCHours()),
  );
}
