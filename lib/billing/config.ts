export type PaidPlan = "PRO" | "ELITE";
export type Interval = "monthly" | "yearly";

/** Dodo product id for a (plan, interval), read from env at call time. */
export function productIdFor(
  plan: PaidPlan,
  interval: Interval,
): string | undefined {
  return process.env[`DODO_PRODUCT_${plan}_${interval.toUpperCase()}`];
}

/** Reverse lookup used by the webhook handler: product id -> plan. */
export function planForProductId(productId: string): PaidPlan | null {
  const plans: PaidPlan[] = ["PRO", "ELITE"];
  const intervals: Interval[] = ["monthly", "yearly"];
  for (const plan of plans) {
    for (const interval of intervals) {
      const id = productIdFor(plan, interval);
      if (id && id === productId) return plan;
    }
  }
  return null;
}

export function isBillingConfigured(): boolean {
  return Boolean(process.env.DODO_PAYMENTS_API_KEY);
}

/** Absolute base URL for Dodo return/redirect URLs. */
export function appBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "http://localhost:3000"
  );
}
