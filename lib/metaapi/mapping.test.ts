import { describe, it, expect } from "vitest";
import { mapDealsToTrades } from "./mapping";
import type { RawDeal } from "./types";

function deal(p: Partial<RawDeal>): RawDeal {
  return {
    id: Math.random().toString(36).slice(2),
    type: "DEAL_TYPE_BUY",
    time: "2026-06-01T10:00:00.000Z",
    ...p,
  };
}

describe("mapDealsToTrades", () => {
  it("reconstructs a closed position from IN/OUT deals", () => {
    const trades = mapDealsToTrades([
      deal({
        positionId: "p1",
        symbol: "EURUSD",
        type: "DEAL_TYPE_BUY",
        entryType: "DEAL_ENTRY_IN",
        volume: 1,
        price: 1.08,
        time: "2026-06-01T10:00:00.000Z",
        commission: -2,
      }),
      deal({
        positionId: "p1",
        symbol: "EURUSD",
        type: "DEAL_TYPE_SELL",
        entryType: "DEAL_ENTRY_OUT",
        volume: 1,
        price: 1.09,
        time: "2026-06-01T12:00:00.000Z",
        profit: 100,
        swap: -1,
      }),
    ]);

    expect(trades).toHaveLength(1);
    const t = trades[0]!;
    expect(t.externalId).toBe("p1");
    expect(t.side).toBe("BUY"); // side comes from the opening deal
    expect(t.openPrice).toBe(1.08);
    expect(t.closePrice).toBe(1.09);
    expect(t.closeTime).not.toBeNull();
    expect(t.commission).toBe(-2);
    expect(t.swap).toBe(-1);
    expect(t.pnl).toBe(97); // 100 + (-2) + (-1)
  });

  it("leaves an open position with null close and pnl", () => {
    const trades = mapDealsToTrades([
      deal({
        positionId: "open1",
        symbol: "GBPUSD",
        type: "DEAL_TYPE_SELL",
        entryType: "DEAL_ENTRY_IN",
        volume: 0.5,
        price: 1.27,
      }),
    ]);
    expect(trades[0]!.side).toBe("SELL");
    expect(trades[0]!.closePrice).toBeNull();
    expect(trades[0]!.pnl).toBeNull();
  });

  it("dedupes deals by positionId and ignores balance deals", () => {
    const trades = mapDealsToTrades([
      deal({
        positionId: "p2",
        symbol: "USDJPY",
        entryType: "DEAL_ENTRY_IN",
        price: 150,
      }),
      deal({ type: "DEAL_TYPE_BALANCE", profit: 1000 }), // no positionId -> skipped
    ]);
    expect(trades).toHaveLength(1);
    expect(trades[0]!.externalId).toBe("p2");
  });
});
