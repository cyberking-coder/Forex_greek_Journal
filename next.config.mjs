import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Sourcemaps are only uploaded to Sentry when an auth token + org/project are
// present (i.e. in CI/Vercel). Locally, withSentryConfig is a harmless no-op.
const sentryBuildOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Tunnel Sentry requests through Next to dodge ad-blockers.
  tunnelRoute: "/monitoring",
  // Tree-shake Sentry's debug logging out of production bundles.
  webpack: { treeshake: { removeDebugLogging: true } },
  // Don't attempt source-map upload without credentials — keeps builds clean.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
};

export default withSentryConfig(nextConfig, sentryBuildOptions);
