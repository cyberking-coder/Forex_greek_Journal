import type { Plan } from "@prisma/client";

export type AnalyticsLevel = "basic" | "full";

export type PlanLimits = {
  /** Max trades logged per calendar month. null = unlimited. */
  tradesPerMonth: number | null;
  /** Max connected MT4/MT5 sync accounts. 0 = no sync. */
  syncAccounts: number;
  aiReports: boolean;
  analytics: AnalyticsLevel;
  backtesting: boolean;
};

/**
 * Central definition of what each plan unlocks. All feature gating across the
 * app derives from this table.
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    tradesPerMonth: 15,
    syncAccounts: 0,
    aiReports: false,
    analytics: "basic",
    backtesting: false,
  },
  PRO: {
    tradesPerMonth: null,
    syncAccounts: 3,
    aiReports: true,
    analytics: "full",
    backtesting: false,
  },
  ELITE: {
    tradesPerMonth: null,
    syncAccounts: Number.POSITIVE_INFINITY,
    aiReports: true,
    analytics: "full",
    backtesting: true,
  },
};

export function planLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

export function tradeLimitFor(plan: Plan): number | null {
  return PLAN_LIMITS[plan].tradesPerMonth;
}

export function syncAccountLimitFor(plan: Plan): number {
  return PLAN_LIMITS[plan].syncAccounts;
}

export function canUseSync(plan: Plan): boolean {
  return PLAN_LIMITS[plan].syncAccounts > 0;
}

export function canUseAiReports(plan: Plan): boolean {
  return PLAN_LIMITS[plan].aiReports;
}

export function canUseBacktesting(plan: Plan): boolean {
  return PLAN_LIMITS[plan].backtesting;
}

export function analyticsLevelFor(plan: Plan): AnalyticsLevel {
  return PLAN_LIMITS[plan].analytics;
}

/** Traders Lounge (real-time chat) is an Elite-only perk. */
export function canUseLounge(plan: Plan): boolean {
  return plan === "ELITE";
}
