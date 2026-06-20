import type { BrokerProvider } from "./types";
import { MetaApiProvider } from "./metaapi-provider";
import { MockBrokerProvider } from "./mock-provider";

/**
 * Returns the active broker provider. MetaApi is used when METAAPI_TOKEN is
 * set; otherwise a deterministic mock provider keeps the flow working in dev.
 * Swap in a self-hosted MetaTrader bridge here without touching callers.
 */
export function getBrokerProvider(): BrokerProvider {
  if (process.env.METAAPI_TOKEN) return new MetaApiProvider();
  return new MockBrokerProvider();
}

export function isUsingMockProvider(): boolean {
  return !process.env.METAAPI_TOKEN;
}
