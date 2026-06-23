"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Shared error UI for route error boundaries. Keeps the message generic (we
 * never surface raw error text to users) while offering a retry and an escape
 * hatch back to safety.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. You can try again, or head back and retry in a moment.",
  reset,
  homeHref = "/",
  homeLabel = "Go home",
}: {
  title?: string;
  description?: string;
  reset?: () => void;
  homeHref?: string;
  homeLabel?: string;
}) {
  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-400">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <div className="mt-6 flex items-center gap-3">
        {reset && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        )}
        <Link
          href={homeHref}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
