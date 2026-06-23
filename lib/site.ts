/**
 * Canonical site metadata, shared by the SEO config, sitemap, robots, and
 * social cards. Keep marketing copy here so titles/descriptions stay in sync.
 */

/** True for an absolute http(s) origin we can use as a base URL. */
function isAbsoluteUrl(value: string | undefined): value is string {
  return !!value && /^https?:\/\//.test(value);
}

function resolveSiteUrl(): string {
  // NEXT_PUBLIC_APP_URL is a CTA target that may be a relative path
  // (e.g. "/dashboard"), so it's only used here when it's an absolute origin.
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];
  const raw = candidates.find(isAbsoluteUrl) ?? "http://localhost:3000";
  // Strip a trailing slash so we can safely concatenate paths.
  return raw.replace(/\/$/, "");
}

export const siteConfig = {
  name: "Greek Journal",
  /** Used as the default <title> and OpenGraph site name. */
  title: "Greek Journal — Forex Trading Journal & Analytics",
  description:
    "Greek Journal is a trading journal for forex traders: sync your MT4/MT5 account, journal every trade, analyze your PnL and win rate, backtest strategies, and get AI-powered performance reports.",
  url: resolveSiteUrl(),
  /** Twitter/X handle without the @, or empty to omit. */
  twitter: "",
  keywords: [
    "forex trading journal",
    "trading journal",
    "MT4 journal",
    "MT5 journal",
    "trade analytics",
    "PnL tracker",
    "win rate",
    "backtesting",
    "trading performance",
    "AI trading coach",
  ],
} as const;

/** Absolute URL for a path on the site. */
export function absoluteUrl(path = ""): string {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
