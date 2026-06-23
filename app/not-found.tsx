import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="bg-accent/15 flex h-12 w-12 items-center justify-center rounded-full text-accent">
        <Compass className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-semibold text-accent">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Go home
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
