import type { Plan } from "@prisma/client";
import { lastReportAt, reportCountSince } from "@/lib/db/reports";

/** Minimum seconds between two generations. */
export const MIN_INTERVAL_SECONDS = 30;

/** Max reports per rolling 24h, by plan. */
const DAILY_LIMIT: Record<Plan, number> = {
  FREE: 0,
  PRO: 10,
  ELITE: 30,
};

export type RateLimitResult = { ok: true } | { ok: false; error: string };

/** Basic anti-spam: enforces a cooldown and a rolling-24h cap per plan. */
export async function checkReportRateLimit(
  userId: string,
  plan: Plan,
): Promise<RateLimitResult> {
  const last = await lastReportAt(userId);
  if (last) {
    const elapsed = (Date.now() - last.getTime()) / 1000;
    if (elapsed < MIN_INTERVAL_SECONDS) {
      const wait = Math.ceil(MIN_INTERVAL_SECONDS - elapsed);
      return {
        ok: false,
        error: `Please wait ${wait}s before generating another report.`,
      };
    }
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const used = await reportCountSince(userId, dayAgo);
  const limit = DAILY_LIMIT[plan];
  if (used >= limit) {
    return {
      ok: false,
      error: `You've reached your daily limit of ${limit} AI reports. Try again later.`,
    };
  }

  return { ok: true };
}
