import { NextResponse } from "next/server";
import { syncAllAccounts } from "@/lib/metaapi/sync";

export const dynamic = "force-dynamic";
// Allow up to 5 minutes — syncing many accounts is slow. On hobby Vercel
// plans the ceiling is lower; deploy the standalone worker for heavy loads.
export const maxDuration = 300;

/**
 * Scheduled global sync. Invoked by Vercel Cron (see vercel.json) or any
 * external scheduler. Protected by CRON_SECRET: callers must send
 * `Authorization: Bearer <CRON_SECRET>`. Vercel Cron sends this automatically
 * when CRON_SECRET is set as an env var.
 */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const started = Date.now();
  const summary = await syncAllAccounts();
  return NextResponse.json({
    ok: true,
    durationMs: Date.now() - started,
    ...summary,
  });
}

export const GET = handle;
export const POST = handle;
