"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { billing, pricingTiers, type PricingTier } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { CtaButton } from "./CtaButton";

function PriceTag({ tier, yearly }: { tier: PricingTier; yearly: boolean }) {
  const amount = yearly ? tier.yearly : tier.monthly;
  if (amount === 0) {
    return <span className="text-4xl font-bold">Free</span>;
  }
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-4xl font-bold">${amount}</span>
      <span className="text-sm text-muted">
        /mo{yearly ? ", billed yearly" : ""}
      </span>
    </span>
  );
}

export function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple, Transparent Pricing"
          subtitle="Start free, upgrade when you're ready. No hidden fees."
        />

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <span
            className={cn(
              "text-sm font-medium",
              !yearly ? "text-foreground" : "text-muted",
            )}
          >
            {billing.monthlyLabel}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly((v) => !v)}
            className="relative h-7 w-12 rounded-full border border-border bg-surface transition-colors"
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
              className={cn(
                "text-sm font-medium",
                yearly ? "text-foreground" : "text-muted",
              )}
            >
              {billing.yearlyLabel}
            </span>
            <span className="bg-accent/15 rounded-full px-2 py-0.5 text-xs font-semibold text-accent">
              {billing.yearlyBadge}
            </span>
          </span>
        </div>

        {/* Tiers */}
        <div className="mt-14 grid items-start gap-8 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "relative flex h-full flex-col rounded-2xl border p-8",
                tier.mostPopular
                  ? "shadow-accent/10 border-accent bg-surface shadow-2xl lg:scale-[1.03]"
                  : "bg-surface/60 border-border",
              )}
            >
              {tier.mostPopular && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Most Popular
                </span>
              )}

              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-2 min-h-[2.5rem] text-sm text-muted">
                {tier.description}
              </p>

              <div className="mt-6">
                <PriceTag tier={tier} yearly={yearly} />
              </div>

              <CtaButton
                href={tier.cta.href}
                variant={tier.mostPopular ? "primary" : "secondary"}
                className="mt-6 w-full"
              >
                {tier.cta.label}
              </CtaButton>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="bg-accent/15 mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-accent">
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
