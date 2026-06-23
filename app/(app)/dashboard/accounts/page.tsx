import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listTradingAccounts } from "@/lib/db/accounts";
import { isUsingMockProvider } from "@/lib/metaapi/provider";
import { formatDateTime } from "@/lib/format";
import { ConnectAccountButton } from "@/components/accounts/ConnectAccountButton";
import { AccountActions } from "@/components/accounts/AccountActions";
import { AutoSync } from "@/components/accounts/AutoSync";
import { SyncStatusBadge } from "@/components/accounts/SyncStatusBadge";

export const metadata = { title: "Accounts" };

export default async function AccountsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const accounts = await listTradingAccounts(user.id);
  const usingMock = isUsingMockProvider();

  return (
    <div className="container-marketing py-10">
      {accounts.length > 0 && <AutoSync />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Connected Accounts
          </h1>
        </div>
        <ConnectAccountButton />
      </div>

      {/* Read-only assurance */}
      <div className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
        <p>
          Accounts are connected with the <strong>investor (read-only)</strong>{" "}
          password. Greek Journal can import your trade history but can never
          place, modify, or close trades.
        </p>
      </div>

      {usingMock && (
        <p className="mt-3 text-xs text-muted">
          Demo mode: <code>METAAPI_TOKEN</code> is not set, so a mock broker
          provider returns sample deals. Set the token to use live MetaApi.
        </p>
      )}

      {accounts.length === 0 ? (
        <div className="bg-surface/60 mt-8 rounded-2xl border border-border p-12 text-center">
          <h2 className="text-lg font-semibold">No accounts connected</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Connect your MetaTrader 4 or 5 account to automatically import your
            trade history.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="bg-surface/60 flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border p-5"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">{account.broker}</h3>
                  <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-xs font-medium text-muted">
                    {account.type}
                  </span>
                  <SyncStatusBadge status={account.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {account.server} · Login {account.login}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {account._count.trades} trades imported · Last synced:{" "}
                  {account.lastSyncedAt
                    ? formatDateTime(account.lastSyncedAt)
                    : "never"}
                </p>
                {account.status === "ERROR" && account.statusMessage && (
                  <p className="mt-1 text-xs text-red-400">
                    {account.statusMessage}
                  </p>
                )}
              </div>

              <AccountActions id={account.id} broker={account.broker} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
