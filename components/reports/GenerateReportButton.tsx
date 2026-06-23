"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { generateReportAction } from "@/app/(app)/dashboard/reports/actions";

const PERIODS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "All time", value: 0 },
];

export function GenerateReportButton({
  canGenerate,
}: {
  canGenerate: boolean;
}) {
  const router = useRouter();
  const [period, setPeriod] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canGenerate) {
    return (
      <div className="border-accent/40 bg-accent/10 flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm">
        <span>AI reports are a Pro &amp; Elite feature.</span>
        <Link
          href="/dashboard/billing"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  function generate() {
    setError(null);
    startTransition(async () => {
      const result = await generateReportAction(period);
      if (result.ok) {
        router.push(`/dashboard/reports?report=${result.reportId}`);
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {pending ? "Analyzing…" : "Generate AI Report"}
        </button>
      </div>
      {error && (
        <span className="max-w-md text-right text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
