"use client";

import { useState, useTransition } from "react";
import { Settings2 } from "lucide-react";
import { createPortalAction } from "@/app/(app)/dashboard/billing/actions";

export function ManageBillingButton() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function open() {
    setError(null);
    startTransition(async () => {
      const result = await createPortalAction();
      if (result.ok) {
        window.location.href = result.url;
        return;
      }
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={open}
        disabled={pending}
        className="hover:border-accent/50 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated disabled:opacity-60"
      >
        <Settings2 className="h-4 w-4" aria-hidden />
        {pending ? "Opening…" : "Manage subscription"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
