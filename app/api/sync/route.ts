import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { syncTradingAccount, syncAllForUser } from "@/lib/metaapi/sync";

/**
 * Incremental sync worker. POST with an optional { accountId } to sync a single
 * account, or no body to sync all of the user's accounts. Safe to call on an
 * interval (polling) or on dashboard load; deals are deduped by externalId.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const accountId =
    typeof body?.accountId === "string" ? body.accountId : undefined;

  if (accountId) {
    const result = await syncTradingAccount(user.id, accountId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const summary = await syncAllForUser(user.id);
  return NextResponse.json({ ok: true, ...summary });
}
