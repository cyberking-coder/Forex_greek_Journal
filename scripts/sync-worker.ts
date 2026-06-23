/**
 * Standalone MT4/MT5 sync worker.
 *
 * Vercel's serverless functions time out, so for many connected accounts run
 * this as a long-lived process on a small host (Railway, Render, Fly.io, a VPS,
 * etc.) instead of — or alongside — the Vercel cron at /api/cron/sync.
 *
 *   SYNC_INTERVAL_MS=60000 npx tsx scripts/sync-worker.ts
 *
 * It shares the app's database and MetaApi config via the same env vars.
 */
import { syncAllAccounts } from "@/lib/metaapi/sync";

const INTERVAL_MS = Number(process.env.SYNC_INTERVAL_MS ?? 60_000);

let running = false;
let stopping = false;

async function tick() {
  if (running) return;
  running = true;
  const startedAt = new Date().toISOString();
  try {
    const summary = await syncAllAccounts();
    console.log(
      `[sync-worker] ${startedAt} accounts=${summary.accounts} created=${summary.created} updated=${summary.updated} failed=${summary.failed}`,
    );
  } catch (err) {
    console.error("[sync-worker] run failed:", err);
  } finally {
    running = false;
  }
}

async function main() {
  console.log(`[sync-worker] starting; interval=${INTERVAL_MS}ms`);
  await tick();
  const timer = setInterval(() => {
    if (!stopping) void tick();
  }, INTERVAL_MS);

  const shutdown = (signal: string) => {
    console.log(`[sync-worker] ${signal} received, shutting down…`);
    stopping = true;
    clearInterval(timer);
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

void main();
