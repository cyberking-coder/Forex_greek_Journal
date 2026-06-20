import { randomUUID } from "crypto";
import {
  type BrokerProvider,
  type ProviderAccountState,
  type ProvisionInput,
  type ProvisionResult,
  type RawDeal,
} from "./types";

/**
 * Deterministic in-memory provider used when METAAPI_TOKEN is not configured,
 * so the connect/sync flow is fully exercisable in development. Returns a small
 * set of canned deals (stable ids so re-syncs dedupe correctly).
 */
export class MockBrokerProvider implements BrokerProvider {
  readonly name = "mock";
  readonly readOnly = true as const;

  async provisionAccount(_input: ProvisionInput): Promise<ProvisionResult> {
    return { accountId: `mock-${randomUUID()}` };
  }

  async deployAccount(): Promise<void> {}

  async getAccountState(): Promise<ProviderAccountState> {
    return { connected: true, state: "DEPLOYED", message: "CONNECTED" };
  }

  async fetchDeals(_accountId: string, since: Date): Promise<RawDeal[]> {
    const day = (offset: number) =>
      new Date(Date.now() - offset * 86400000).toISOString();

    const deals: RawDeal[] = [
      // Closed winning EURUSD position
      {
        id: "d1",
        positionId: "pos-1",
        type: "DEAL_TYPE_BUY",
        entryType: "DEAL_ENTRY_IN",
        symbol: "EURUSD",
        volume: 1,
        price: 1.085,
        time: day(5),
        commission: -2,
      },
      {
        id: "d2",
        positionId: "pos-1",
        type: "DEAL_TYPE_SELL",
        entryType: "DEAL_ENTRY_OUT",
        symbol: "EURUSD",
        volume: 1,
        price: 1.095,
        time: day(5),
        profit: 100,
        swap: -1,
      },
      // Closed losing GBPUSD position
      {
        id: "d3",
        positionId: "pos-2",
        type: "DEAL_TYPE_SELL",
        entryType: "DEAL_ENTRY_IN",
        symbol: "GBPUSD",
        volume: 0.5,
        price: 1.27,
        time: day(3),
        commission: -1,
      },
      {
        id: "d4",
        positionId: "pos-2",
        type: "DEAL_TYPE_BUY",
        entryType: "DEAL_ENTRY_OUT",
        symbol: "GBPUSD",
        volume: 0.5,
        price: 1.28,
        time: day(3),
        profit: -50,
        swap: 0,
      },
      // Still-open USDJPY position
      {
        id: "d5",
        positionId: "pos-3",
        type: "DEAL_TYPE_BUY",
        entryType: "DEAL_ENTRY_IN",
        symbol: "USDJPY",
        volume: 1,
        price: 150.2,
        time: day(1),
      },
    ];

    // Respect the incremental cursor.
    return deals.filter((d) => new Date(d.time).getTime() >= since.getTime());
  }

  async removeAccount(): Promise<void> {}
}
