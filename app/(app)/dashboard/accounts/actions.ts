"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { connectAccountSchema } from "@/lib/validations/account";
import {
  createTradingAccount,
  deleteTradingAccount,
  getTradingAccount,
  countTradingAccounts,
  updateAccountSync,
} from "@/lib/db/accounts";
import { syncAccountLimitFor } from "@/lib/plan";
import { getBrokerProvider } from "@/lib/metaapi/provider";
import { syncTradingAccount, syncAllForUser } from "@/lib/metaapi/sync";
import { BrokerError, type AccountActionResult } from "@/lib/metaapi/types";

export async function connectAccountAction(
  raw: unknown,
): Promise<AccountActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  // Enforce the plan's sync-account limit.
  const limit = syncAccountLimitFor(user.plan);
  if (limit <= 0) {
    return {
      ok: false,
      error:
        "Account sync is available on the Pro and Elite plans. Upgrade to connect a broker.",
    };
  }
  const existing = await countTradingAccounts(user.id);
  if (existing >= limit) {
    return {
      ok: false,
      error: `Your plan allows ${limit} connected account(s). Upgrade to connect more.`,
    };
  }

  const parsed = connectAccountSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const { broker, server, login, password, platform } = parsed.data;

  const provider = getBrokerProvider();
  try {
    const { accountId } = await provider.provisionAccount({
      name: broker,
      server,
      login,
      password,
      platform,
    });

    const account = await createTradingAccount(user.id, {
      broker,
      login,
      server,
      type: platform,
      metaApiAccountId: accountId,
      investorPassword: encryptSecret(password),
      status: "DEPLOYING",
    });

    // Best-effort deploy + state check (deployment may complete asynchronously).
    try {
      await provider.deployAccount(accountId);
      const state = await provider.getAccountState(accountId);
      await updateAccountSync(account.id, {
        status: state.connected ? "CONNECTED" : "DEPLOYING",
        statusMessage: null,
      });
    } catch {
      // Leave as DEPLOYING; a later sync will surface real status.
    }

    revalidatePath("/dashboard/accounts");
    return { ok: true, message: "Account connected (read-only)." };
  } catch (err) {
    const error =
      err instanceof BrokerError
        ? err.message
        : "Could not connect the account. Please try again.";
    return { ok: false, error };
  }
}

export async function disconnectAccountAction(
  id: string,
): Promise<AccountActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const account = await getTradingAccount(user.id, id);
  if (!account) return { ok: false, error: "Account not found." };

  if (account.metaApiAccountId) {
    try {
      await getBrokerProvider().removeAccount(account.metaApiAccountId);
    } catch {
      // Ignore provider errors on teardown — still remove locally.
    }
  }
  await deleteTradingAccount(user.id, id);

  revalidatePath("/dashboard/accounts");
  return { ok: true };
}

export async function syncAccountAction(
  id: string,
): Promise<AccountActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const result = await syncTradingAccount(user.id, id);
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/trades");
  revalidatePath("/dashboard");

  if (!result.ok) return { ok: false, error: result.error };
  return {
    ok: true,
    message: `Synced ${result.total} trades (${result.created} new, ${result.updated} updated).`,
  };
}

export async function syncAllAction(): Promise<AccountActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { accounts, created, updated } = await syncAllForUser(user.id);
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard/trades");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: `Synced ${accounts} account(s): ${created} new, ${updated} updated.`,
  };
}
