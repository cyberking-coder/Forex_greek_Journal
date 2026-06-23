"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorState } from "@/components/ui/ErrorState";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorState
      title="This page hit a snag"
      description="We couldn't load your dashboard data. Try again, or return to the overview."
      reset={reset}
      homeHref="/dashboard"
      homeLabel="Back to dashboard"
    />
  );
}
