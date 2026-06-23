"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import type { Plan } from "@prisma/client";
import { billing, pricingTiers, type PricingTier } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { createCheckoutAction } from "@/app/(app)/dashboard/billing/actions";
import type { Interval, PaidPlan } from "@/lib/billing/config";

const TIER_PLAN: Record<PricingTier["id"], Plan> = {
  free: "FREE",
  pro: "PRO",
  elite: "ELITE",
};

export function PlanSelector({
  currentPlan,
  billingConfigured,
  initialInterval = "monthly",
}: {
  currentPlan: Plan;
  billingConfigured: boolean;
  initialInterval?: Interval;
}) {
  const [yearly, setYearly] = useState(initialInterval === "yearly");
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function checkout(plan: PaidPlan) {
    setError(null);
    setPendingPlan(plan);
    startTransition(async () => {
      const result = await createCheckoutAction(
        plan,
        yearly ? "yearly" : "monthly",
      );
      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      setPendingPlan(null);
      setError(result.error);
    });
  }

  return (
    <div>
      {/* Billing interval toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn("text-sm", !yearly ? "text-foreground" : "text-muted")}
        >
          {billing.monthlyLabel}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={yearly}
          onClick={() => setYearly((v) => !v)}
          className="relative h-7 w-12 rounded-full border border-border bg-surface"
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-accent transition-transform",
              yearly ? "translate-x-6" : "translate-x-0.5",
            )}
          />
        </button>
        <span className="flex items-center gap-2">
          <span
            className={cn("text-sm", yearly ? "text-foreground" : "text-muted")}
          >
            {billing.yearlyLabel}
          </span>
          <span className="bg-accent/15 rounded-full px-2 py-0.5 text-xs font-semibold text-accent">
            {billing.yearlyBadge}
          </span>
        </span>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
        {pricingTiers.map((tier) => {
          const plan = TIER_PLAN[tier.id];
          const amount = yearly ? tier.yearly : tier.monthly;
          const isCurrent = plan === currentPlan;
          const isPaid = tier.id !== "free";

          return (
            <div
              key={tier.id}
              className={cn(
                "relative flex h-full flex-col rounded-2xl border p-6",
                tier.mostPopular
                  ? "border-accent bg-surface"
                  : "bg-surface/60 border-border",
              )}
            >
              {tier.mostPopular && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Most Popular
                </span>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                {isCurrent && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted">{tier.description}</p>
              <p className="mt-4 text-3xl font-bold">
                {amount === 0 ? "Free" : `$${amount}`}
                {amount !== 0 && (
                  <span className="text-sm font-normal text-muted">/mo</span>
                )}
              </p>

              <div className="mt-5">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted"
                  >
                    Current plan
                  </button>
                ) : isPaid ? (
                  <button
                    type="button"
                    onClick={() => checkout(plan as PaidPlan)}
                    disabled={pending || !billingConfigured}
                    className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
                  >
                    {pending && pendingPlan === plan
                      ? "Redirecting…"
                      : currentPlan === "ELITE"
                        ? "Switch plan"
                        : `Upgrade to ${tier.name}`}
                  </button>
                ) : (
                  <span className="block text-center text-sm text-muted">
                    Manage via the portal to downgrade
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-2.5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <span className="bg-accent/15 mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full text-accent">
                      <Check className="h-3 w-3" aria-hidden />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {!billingConfigured && (
        <p className="mt-4 text-center text-xs text-muted">
          Billing is not configured on the server (set{" "}
          <code>DODO_PAYMENTS_API_KEY</code> and the product ids). Upgrade
          buttons are disabled.
        </p>
      )}
      {error && (
        <p className="mt-3 text-center text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
