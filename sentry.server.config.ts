import * as Sentry from "@sentry/nextjs";

// Server-side Sentry. No-op when SENTRY_DSN is unset, so local/dev and
// self-hosters without Sentry are unaffected.
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  ),
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  // Don't capture request bodies / cookies by default.
  sendDefaultPii: false,
});
