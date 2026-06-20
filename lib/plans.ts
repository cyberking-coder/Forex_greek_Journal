import type { Plan } from "@prisma/client";

/**
 * Maximum number of trades a plan may log per calendar month.
 * `null` means unlimited.
 */
export const MONTHLY_TRADE_LIMIT: Record<Plan, number | null> = {
  FREE: 15,
  PRO: null,
  ELITE: null,
};

export function tradeLimitFor(plan: Plan): number | null {
  return MONTHLY_TRADE_LIMIT[plan];
}

/** AI reports are a paid feature (Pro and Elite). */
export function canUseAiReports(plan: Plan): boolean {
  return plan === "PRO" || plan === "ELITE";
}
