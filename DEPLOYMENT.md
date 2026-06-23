# Deployment

This guide covers deploying Greek Journal (the Next.js app + marketing site) to
**Vercel**, wiring up Postgres, configuring secrets, scheduling MT4/MT5 sync,
and enabling error monitoring with Sentry.

## Architecture

- **App + marketing** — one Next.js 14 App Router project. Marketing lives under
  `app/(marketing)`, the authenticated app under `app/(app)`. Deploy as a single
  Vercel project.
- **Database** — PostgreSQL via Prisma.
- **MT4/MT5 sync** — incremental sync of broker deals. Triggered three ways:
  1. On-demand while the dashboard is open (client polling → `POST /api/sync`).
  2. A scheduled global sync (`/api/cron/sync`) via **Vercel Cron**.
  3. A **standalone worker** (`scripts/sync-worker.ts`) for heavy loads, since
     serverless functions time out.
- **Realtime chat** — optional, via Pusher (degrades to polling when unset).
- **Monitoring** — optional, via Sentry (no-op when the DSN is unset).

## 1. Provision Postgres

Use any managed Postgres. Good fits for Vercel:

- **Vercel Postgres** (Neon under the hood), **Neon**, or **Supabase**.

You need two connection strings:

| Var            | Purpose                               | Notes                          |
| -------------- | ------------------------------------- | ------------------------------ |
| `DATABASE_URL` | Runtime queries (pooled)              | Use the **pooled** connection. |
| `DIRECT_URL`   | `prisma migrate` (direct, non-pooled) | Use the **direct** connection. |

Serverless needs a pooled connection (PgBouncer/Neon pooler) to avoid exhausting
connections. Prisma Migrate needs the direct one.

## 2. Configure environment variables

Copy `.env.example` and fill it in. In Vercel, add each as a
**Project → Settings → Environment Variables** entry (mark secrets as
"Sensitive"). Minimum for production:

- `DATABASE_URL`, `DIRECT_URL`
- `AUTH_SECRET` (`openssl rand -base64 32`)
- `ENCRYPTION_KEY` (`openssl rand -base64 32`) — encrypts stored investor passwords
- `NEXT_PUBLIC_APP_URL` — your production URL (drives canonical URLs, sitemap,
  robots, OG cards, and share links)
- `CRON_SECRET` (`openssl rand -hex 32`) — protects the cron sync endpoint

Optional integrations (safe to leave blank — each feature degrades gracefully):

- `ANTHROPIC_API_KEY` — AI reports
- `METAAPI_TOKEN` — live MT4/MT5 sync (mock provider used when unset)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google sign-in
- `DODO_PAYMENTS_*` — billing
- `SUPABASE_*` — screenshot storage
- `PUSHER_*` / `NEXT_PUBLIC_PUSHER_*` — realtime lounge
- `SENTRY_*` / `NEXT_PUBLIC_SENTRY_DSN` — monitoring (see §6)

Store provider keys (MetaApi, Anthropic, Dodo, etc.) as Vercel **secrets**, not
in the repo.

## 3. Build & database migrations

`postinstall` runs `prisma generate` automatically. Apply migrations against the
production database with:

```bash
npm run db:deploy   # prisma migrate deploy
```

Run this from CI/locally pointed at the prod `DIRECT_URL`, **or** prepend it to
the Vercel build command:

```
prisma migrate deploy && next build
```

(Single-runner builds only — don't run migrations from many concurrent builds.)

## 4. Deploy to Vercel

1. Import the Git repo into Vercel. Framework preset: **Next.js** (also set in
   `vercel.json`).
2. Add the environment variables from §2.
3. Deploy. The included `vercel.json` registers the cron and function limits.

## 5. Scheduled MT4/MT5 sync

`vercel.json` schedules `GET /api/cron/sync` every 5 minutes:

```json
{ "crons": [{ "path": "/api/cron/sync", "schedule": "*/5 * * * *" }] }
```

- The endpoint requires `Authorization: Bearer $CRON_SECRET`. Vercel Cron sends
  this automatically once `CRON_SECRET` is set.
- **Plan limits:** sub-daily cron frequency and `maxDuration: 300` require the
  Vercel **Pro** plan. On Hobby, lower the schedule to daily and/or run the
  standalone worker below.

### Standalone worker (recommended for many accounts)

Serverless functions time out, so for real-time-ish sync at scale run the worker
as a long-lived process on a small host (**Railway**, **Render**, **Fly.io**, or
a VPS):

```bash
SYNC_INTERVAL_MS=60000 npm run worker:sync
```

Give it the same `DATABASE_URL`, `DIRECT_URL`, `METAAPI_TOKEN`, and
`ENCRYPTION_KEY`. It calls `syncAllAccounts()` on an interval and logs a summary
each run. When the worker is handling sync, you can drop the Vercel cron.

## 6. Monitoring (Sentry)

Sentry is wired up (`instrumentation.ts`, `instrumentation-client.ts`,
`sentry.server.config.ts`, `sentry.edge.config.ts`, and `withSentryConfig` in
`next.config.mjs`) but **only activates when a DSN is present**.

1. Create a project at sentry.io and copy the DSN.
2. Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in Vercel.
3. For readable stack traces, set `SENTRY_ORG`, `SENTRY_PROJECT`, and
   `SENTRY_AUTH_TOKEN` (build-time only) so source maps upload during the build.

Errors from server components, route handlers, the edge, and the browser are
captured automatically; route error boundaries (`app/error.tsx`,
`app/global-error.tsx`, dashboard `error.tsx`) report explicitly too.

## GitHub Pages (landing page only)

**GitHub Pages serves static files only — it cannot run this app** (auth,
database, MT5 sync, API routes, server actions, billing, chat, and share cards
all need a server). So Pages is used here to host just the **marketing landing
page**, which links visitors to the real app deployed on Vercel/Node.

What's included:

- `docs/index.html` — a self-contained static landing page (no build step).
- `.github/workflows/deploy-pages.yml` — builds and publishes `docs/` to Pages.

To enable it:

1. **Settings → Pages → Build and deployment → Source:** select
   **GitHub Actions**.
2. (Optional) **Settings → Secrets and variables → Actions → Variables:** add a
   repository variable `APP_URL` pointing at your deployed app
   (e.g. `https://greek-journal.vercel.app`). The landing page's buttons are
   rewritten to this URL at deploy time; without it they fall back to the repo
   URL.
3. Push to `main`/`master` (or run the workflow manually from the **Actions**
   tab). The landing page goes live at
   `https://<user>.github.io/<repo>/`.

To change the landing copy, edit `docs/index.html` directly.

## Post-deploy checklist

- [ ] `https://<domain>/` loads; `https://<domain>/sitemap.xml` and `/robots.txt` resolve
- [ ] Sign up / sign in works (DB reachable, `AUTH_SECRET` set)
- [ ] `NEXT_PUBLIC_APP_URL` matches the live domain (check OG tags / share links)
- [ ] `curl -H "Authorization: Bearer $CRON_SECRET" https://<domain>/api/cron/sync` returns `{ ok: true }`
- [ ] (If using Sentry) a test error appears in the Sentry dashboard
- [ ] (If using GitHub Pages) the landing page loads and its buttons point to the app
