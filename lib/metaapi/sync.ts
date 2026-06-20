import {
  getTradingAccount,
  listTradingAccounts,
  updateAccountSync,
  upsertSyncedTrade,
} from "@/lib/db/accounts";
import { getBrokerProvider } from "./provider";
import { mapDealsToTrades } from "./mapping";

const DEFAULT_LOOKBACK_DAYS = 90;

export type SyncOutcome =
  | { ok: true; created: number; updated: number; total: number }
  | { ok: false; error: string };

/** Incrementally syncs one account's deals into Trade rows (deduped). */
export async function syncTradingAccount(
  userId: string,
  accountId: string,
): Promise<SyncOutcome> {
  const account = await getTradingAccount(userId, accountId);
  if (!account) return { ok: false, error: "Account not found." };
  if (!account.metaApiAccountId) {
    return { ok: false, error: "Account is not connected." };
  }

  await updateAccountSync(account.id, {
    status: "SYNCING",
    statusMessage: null,
  });

  const provider = getBrokerProvider();
  try {
    const since =
      account.lastSyncedAt ??
      new Date(Date.now() - DEFAULT_LOOKBACK_DAYS * 86_400_000);

    const deals = await provider.fetchDeals(account.metaApiAccountId, since);
    const mapped = mapDealsToTrades(deals);

    let created = 0;
    let updated = 0;
    for (const m of mapped) {
      const result = await upsertSyncedTrade(userId, account.id, m);
      if (result === "created") created++;
      else updated++;
    }

    // Advance the cursor to the latest deal time we saw.
    const latest = deals.reduce(
      (max, d) => Math.max(max, new Date(d.time).getTime()),
      since.getTime(),
    );

    await updateAccountSync(account.id, {
      status: "CONNECTED",
      statusMessage: null,
      lastSyncedAt: new Date(latest),
    });

    return { ok: true, created, updated, total: mapped.length };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Sync failed.";
    await updateAccountSync(account.id, {
      status: "ERROR",
      statusMessage: error,
    });
    return { ok: false, error };
  }
}

/** Syncs all of a user's active, connected accounts. */
export async function syncAllForUser(userId: string): Promise<{
  accounts: number;
  created: number;
  updated: number;
}> {
  const accounts = await listTradingAccounts(userId);
  let created = 0;
  let updated = 0;
  let synced = 0;
  for (const account of accounts) {
    if (!account.isActive || !account.metaApiAccountId) continue;
    const result = await syncTradingAccount(userId, account.id);
    if (result.ok) {
      created += result.created;
      updated += result.updated;
      synced++;
    }
  }
  return { accounts: synced, created, updated };
}
