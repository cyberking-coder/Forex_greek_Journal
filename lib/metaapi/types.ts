import type { AccountPlatform } from "@prisma/client";

export type ProvisionInput = {
  /** Display name / broker label. */
  name: string;
  server: string;
  login: string;
  /** Investor (read-only) password — used transiently, never logged. */
  password: string;
  platform: AccountPlatform;
};

export type ProvisionResult = { accountId: string };

export type ProviderAccountState = {
  connected: boolean;
  /** Raw provider state, e.g. DEPLOYED / DEPLOYING / UNDEPLOYED. */
  state: string;
  message?: string;
};

/** A raw historical deal as returned by the broker provider. */
export type RawDeal = {
  id: string;
  positionId?: string;
  orderId?: string;
  /** e.g. DEAL_TYPE_BUY | DEAL_TYPE_SELL | DEAL_TYPE_BALANCE. */
  type: string;
  /** e.g. DEAL_ENTRY_IN | DEAL_ENTRY_OUT | DEAL_ENTRY_INOUT. */
  entryType?: string;
  symbol?: string;
  volume?: number;
  price?: number;
  profit?: number;
  commission?: number;
  swap?: number;
  /** ISO timestamp (broker time). */
  time: string;
};

/**
 * Broker integration abstraction. MetaApi is one implementation; a self-hosted
 * MetaTrader bridge can be dropped in later without touching callers.
 */
export interface BrokerProvider {
  readonly name: string;
  /** Read-only: this provider never places or modifies trades. */
  readonly readOnly: true;

  provisionAccount(input: ProvisionInput): Promise<ProvisionResult>;
  deployAccount(accountId: string): Promise<void>;
  getAccountState(accountId: string): Promise<ProviderAccountState>;
  /** Historical deals at/after `since`. */
  fetchDeals(accountId: string, since: Date): Promise<RawDeal[]>;
  removeAccount(accountId: string): Promise<void>;
}

/** Result returned by account server actions. */
export type AccountActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

/** Raised by providers with a user-friendly message. */
export class BrokerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrokerError";
  }
}
