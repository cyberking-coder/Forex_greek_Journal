import {
  BrokerError,
  type BrokerProvider,
  type ProviderAccountState,
  type ProvisionInput,
  type ProvisionResult,
  type RawDeal,
} from "./types";

const PROVISIONING_URL =
  process.env.METAAPI_PROVISIONING_URL ||
  "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";
const CLIENT_URL =
  process.env.METAAPI_CLIENT_URL ||
  "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

/**
 * MetaApi (metaapi.cloud) implementation of BrokerProvider over its REST API.
 * Accounts are provisioned with the investor (read-only) password, so this
 * integration can never place or modify trades.
 */
export class MetaApiProvider implements BrokerProvider {
  readonly name = "metaapi";
  readonly readOnly = true as const;

  private get token(): string {
    const token = process.env.METAAPI_TOKEN;
    if (!token) throw new BrokerError("METAAPI_TOKEN is not configured.");
    return token;
  }

  private async request<T>(
    base: string,
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        ...init,
        headers: {
          "auth-token": this.token,
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        cache: "no-store",
      });
    } catch {
      throw new BrokerError(
        "Could not reach MetaApi. Check your network and try again.",
      );
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new BrokerError(
        mapHttpError(res.status, detail) ||
          `MetaApi request failed (${res.status}).`,
      );
    }
    if (res.status === 204) return undefined as T;
    return (await res.json().catch(() => ({}))) as T;
  }

  async provisionAccount(input: ProvisionInput): Promise<ProvisionResult> {
    const body = {
      name: input.name,
      type: "cloud-g2",
      login: input.login,
      password: input.password,
      server: input.server,
      platform: input.platform.toLowerCase(), // mt4 | mt5
      magic: 0,
      application: "MetaApi",
      // Investor password => read-only access.
      accessType: "investor",
    };
    const result = await this.request<{ id: string }>(
      PROVISIONING_URL,
      "/users/current/accounts",
      { method: "POST", body: JSON.stringify(body) },
    );
    if (!result?.id) {
      throw new BrokerError("MetaApi did not return an account id.");
    }
    return { accountId: result.id };
  }

  async deployAccount(accountId: string): Promise<void> {
    await this.request(
      PROVISIONING_URL,
      `/users/current/accounts/${accountId}/deploy`,
      { method: "POST" },
    );
  }

  async getAccountState(accountId: string): Promise<ProviderAccountState> {
    const acc = await this.request<{
      state?: string;
      connectionStatus?: string;
    }>(PROVISIONING_URL, `/users/current/accounts/${accountId}`);
    const state = acc.state ?? "UNKNOWN";
    return {
      state,
      connected: acc.connectionStatus === "CONNECTED" || state === "DEPLOYED",
      message: acc.connectionStatus,
    };
  }

  async fetchDeals(accountId: string, since: Date): Promise<RawDeal[]> {
    const start = since.toISOString();
    const end = new Date().toISOString();
    const deals = await this.request<RawDeal[]>(
      CLIENT_URL,
      `/users/current/accounts/${accountId}/history-deals/time/${encodeURIComponent(
        start,
      )}/${encodeURIComponent(end)}`,
    );
    return Array.isArray(deals) ? deals : [];
  }

  async removeAccount(accountId: string): Promise<void> {
    await this.request(
      PROVISIONING_URL,
      `/users/current/accounts/${accountId}`,
      { method: "DELETE" },
    );
  }
}

function mapHttpError(status: number, detail: string): string | null {
  if (status === 401 || status === 403)
    return "MetaApi rejected the token. Check METAAPI_TOKEN.";
  if (status === 400)
    return "Invalid account details. Verify the server name, login, and investor password.";
  if (status === 404) return "Account not found on MetaApi.";
  if (status === 429)
    return "MetaApi rate limit reached. Please retry shortly.";
  if (status >= 500) return "MetaApi is temporarily unavailable.";
  return detail ? detail.slice(0, 200) : null;
}
