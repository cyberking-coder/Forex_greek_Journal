/**
 * Single source of truth for marketing-site copy.
 * Edit text here rather than inside individual section components.
 */

/**
 * Marketing CTAs link to in-app routes. Marketing and the app ship from one
 * deployment, so relative paths always resolve on the same domain — no env var
 * needed (pointing these at NEXT_PUBLIC_APP_URL makes "Get Started" loop back to
 * the homepage).
 */
export const appUrl = "/signup"; // "Get Started" / "Create Account"
export const loginUrl = "/login"; // "Sign In"

export const brand = {
  name: "Greek Journal",
  tagline: "Track Trades. Analyze PnL. Master Markets.",
};

export const nav = {
  links: [
    { label: "Features", href: "#features" },
    { label: "Community", href: "#community" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "#blog" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Get Started", href: appUrl },
};

export const hero = {
  headline: "Track Trades. Analyze PnL. Master Markets.",
  subline:
    "Sync your MT5 account in real time, journal every trade with rich context, backtest your strategies, and let AI surface the patterns behind your performance.",
  cta: { label: "Get Started", href: appUrl },
  reviewers: [
    { name: "Alex R.", quote: "Cut my revenge trades in half." },
    { name: "Priya N.", quote: "The AI reports are scary good." },
    { name: "Marco D.", quote: "Backtesting finally feels effortless." },
    { name: "Sara K.", quote: "My journal, my edge." },
  ],
  reviewSummary: "Loved by 2,000+ traders",
  stats: [
    {
      label: "Today's PnL",
      value: "+$2,847.50",
      delta: "+12.4%",
      positive: true,
    },
    {
      label: "Win Rate",
      value: "67.8%",
      delta: "Last 30 days",
      positive: true,
    },
  ],
};

export type FeatureItem = {
  title: string;
  description: string;
  bullets: [string, string, string];
  imageLabel: string;
};

export const features = {
  title: "Everything You Need to Master Your Trading",
  subtitle:
    "One platform for syncing, journaling, analyzing, and improving — built for serious traders.",
  items: [
    {
      title: "Strategy Backtesting",
      description:
        "Validate ideas against historical data before risking real capital. Tune parameters and compare outcomes side by side.",
      bullets: [
        "Replay markets bar-by-bar or run full historical passes",
        "Compare equity curves across strategy variants",
        "Export results to refine your edge",
      ],
      imageLabel: "Backtesting Engine",
    },
    {
      title: "Rich Trade Journaling",
      description:
        "Capture the full story behind every trade — setup, emotions, screenshots, and notes — so you can learn from each one.",
      bullets: [
        "Attach charts, tags, and free-form notes",
        "Track emotional state and rule adherence",
        "Searchable, filterable trade history",
      ],
      imageLabel: "Trade Journal",
    },
    {
      title: "Powerful Analytics",
      description:
        "Understand your performance at a glance with PnL breakdowns, win-rate trends, and risk metrics that actually matter.",
      bullets: [
        "Drawdown, expectancy, and R-multiple analysis",
        "Performance by symbol, session, and setup",
        "Interactive equity and PnL charts",
      ],
      imageLabel: "Analytics Dashboard",
    },
    {
      title: "MT5 Real-Time Sync",
      description:
        "Connect your MetaTrader 5 account and watch trades flow in automatically — no manual entry, no missed fills.",
      bullets: [
        "Automatic import of open and closed positions",
        "Live balance, equity, and margin updates",
        "Secure, read-only account connection",
      ],
      imageLabel: "MT5 Sync",
    },
    {
      title: "AI-Powered Reports",
      description:
        "Let AI read your journal and surface the patterns, leaks, and strengths you'd never spot on your own.",
      bullets: [
        "Weekly performance summaries in plain language",
        "Behavioral pattern and tilt detection",
        "Actionable suggestions tied to your data",
      ],
      imageLabel: "AI Reports",
    },
    {
      title: "Community & Leaderboard",
      description:
        "Trade alongside a community of serious traders. Share wins, compare stats, and climb the leaderboard.",
      bullets: [
        "Global and friends leaderboards",
        "Shareable performance cards",
        "Discuss setups in the Traders Lounge",
      ],
      imageLabel: "Community",
    },
  ] satisfies FeatureItem[],
};

export const community = {
  title: "Trade Together, Grow Together",
  subtitle:
    "Trading is lonely. Greek Journal connects you with traders who push you to get better.",
  blocks: [
    {
      title: "Traders Lounge",
      description:
        "A focused space to share setups, ask questions, and break down the market with traders who take it as seriously as you do.",
      bullets: [
        "Topic channels for strategies and markets",
        "Share annotated charts and journal entries",
        "Real conversations, zero noise",
      ],
      imageLabel: "Traders Lounge",
    },
    {
      title: "Leaderboard & Share Cards",
      description:
        "Track where you stand and celebrate your progress with beautiful, shareable performance cards.",
      bullets: [
        "Climb global and friends-only leaderboards",
        "Auto-generated share cards for your wins",
        "Verified stats pulled straight from your data",
      ],
      imageLabel: "Leaderboard",
    },
  ],
};

export const faq = {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know before you start journaling.",
  items: [
    {
      question: "What is Greek Journal?",
      answer:
        "Greek Journal is a trading journal and analytics platform for forex and futures traders. It syncs your trades, helps you journal them with context, analyzes your performance, and uses AI to surface insights that help you improve.",
    },
    {
      question: "How does MT5 sync work?",
      answer:
        "Connect your MetaTrader 5 account with a secure, read-only connection. Your open and closed positions, balance, and equity flow into Greek Journal automatically — no manual entry required.",
    },
    {
      question: "What do the AI reports include?",
      answer:
        "AI reports summarize your performance in plain language, detect behavioral patterns like tilt or overtrading, and offer concrete, data-backed suggestions for what to work on next.",
    },
    {
      question: "Can I backtest my strategies?",
      answer:
        "Yes. Replay historical market data bar-by-bar or run full passes, tune your parameters, and compare equity curves across strategy variants before risking real capital.",
    },
    {
      question: "Is my data safe?",
      answer:
        "Your data is encrypted in transit and at rest, and broker connections are read-only — Greek Journal can never place or modify trades on your account. You can export or delete your data at any time.",
    },
    {
      question: "Is there a free plan?",
      answer:
        "Yes. The Free plan lets you journal trades and explore core analytics so you can get a feel for the platform before upgrading to Pro or Elite.",
    },
    {
      question: "Can I share my results?",
      answer:
        "Absolutely. Generate beautiful share cards from your verified stats and post them anywhere, or compare yourself against the community leaderboard.",
    },
    {
      question: "Which markets are supported?",
      answer:
        "Greek Journal supports forex, indices, metals, and futures through MT5, with more integrations on the way. You can also journal trades from any market manually.",
    },
  ],
};

export const contact = {
  title: "Get in Touch",
  subtitle:
    "Questions, feedback, or partnership ideas? We'd love to hear from you.",
  email: "hello@greekjournal.app",
  whatsapp: {
    label: "Chat on WhatsApp",
    href: "https://wa.me/10000000000",
  },
};

export const footer = {
  description:
    "The trading journal for traders who are serious about getting better.",
  columns: [
    {
      title: "Platform",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Community", href: "#community" },
        { label: "Backtesting", href: "#features" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Blog", href: "#blog" },
        { label: "Contact", href: "#contact" },
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
      ],
    },
    {
      title: "Get Started",
      links: [
        { label: "Create Account", href: appUrl },
        { label: "Sign In", href: loginUrl },
        { label: "FAQ", href: "#faq" },
      ],
    },
  ],
  social: [
    { label: "X / Twitter", href: "https://x.com", icon: "twitter" },
    { label: "Discord", href: "https://discord.com", icon: "discord" },
    { label: "YouTube", href: "https://youtube.com", icon: "youtube" },
  ],
  copyright: `© ${new Date().getFullYear()} Greek Journal. All rights reserved.`,
};
