import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
        Work in progress
      </span>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
        Forex <span className="text-accent">Greek</span> Journal
      </h1>
      <p className="mt-4 max-w-md text-balance text-muted">
        A trading journal built for forex traders. The foundation is set —
        features are on the way.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
