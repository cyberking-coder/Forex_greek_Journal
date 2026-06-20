/**
 * Pricing configuration. Stubbed with reasonable values — edit freely.
 * Prices are per-month; the yearly figure is what the user pays per month
 * when billed annually.
 */

import { appUrl } from "@/lib/marketing/content";

export const billing = {
  monthlyLabel: "Monthly",
  yearlyLabel: "Yearly",
  yearlyBadge: "Save 17%",
};

export type PricingTier = {
  id: "free" | "pro" | "elite";
  name: string;
  description: string;
  /** Price per month when billed monthly. Use null for custom/contact. */
  monthly: number;
  /** Effective price per month when billed yearly. */
  yearly: number;
  features: string[];
  cta: { label: string; href: string };
  mostPopular?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    description: "Everything you need to start journaling your trades.",
    monthly: 0,
    yearly: 0,
    features: [
      "Up to 100 journaled trades",
      "Manual trade entry",
      "Core analytics dashboard",
      "Basic equity & PnL charts",
      "Community access",
    ],
    cta: { label: "Get Started", href: appUrl },
  },
  {
    id: "pro",
    name: "Pro",
    description: "For active traders who want the full edge.",
    monthly: 19,
    yearly: 15,
    mostPopular: true,
    features: [
      "Unlimited journaled trades",
      "MT5 real-time sync",
      "Advanced analytics & risk metrics",
      "Strategy backtesting",
      "Weekly AI performance reports",
      "Shareable performance cards",
    ],
    cta: { label: "Get Started", href: appUrl },
  },
  {
    id: "elite",
    name: "Elite",
    description: "Maximum power for professionals and prop traders.",
    monthly: 49,
    yearly: 41,
    features: [
      "Everything in Pro",
      "Multiple MT5 accounts",
      "Daily AI reports & tilt detection",
      "Priority backtesting engine",
      "Leaderboard verification badge",
      "Priority support",
    ],
    cta: { label: "Get Started", href: appUrl },
  },
];
