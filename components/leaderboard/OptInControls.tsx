"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import {
  setOptInAction,
  setDisplayNameAction,
} from "@/app/(app)/dashboard/leaderboard/actions";
import { toast } from "@/lib/toast";

export function OptInControls({
  optedIn,
  displayName,
}: {
  optedIn: boolean;
  displayName: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [pending, startTransition] = useTransition();

  function toggle(next: boolean) {
    startTransition(async () => {
      const res = await setOptInAction(next);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        next
          ? "You've joined the leaderboard."
          : "You've left the leaderboard.",
      );
      router.refresh();
    });
  }

  function saveName() {
    startTransition(async () => {
      const res = await setDisplayNameAction(name);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Display name saved.");
      router.refresh();
    });
  }

  if (!optedIn) {
    return (
      <div className="border-accent/40 bg-accent/10 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
        <p className="flex items-center gap-2 text-sm">
          <Trophy className="h-4 w-4 text-accent" aria-hidden />
          Join the leaderboard to rank against other traders. Only your display
          name and aggregate stats are shown.
        </p>
        <button
          type="button"
          onClick={() => toggle(true)}
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Joining…" : "Join leaderboard"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface/60 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <label htmlFor="displayName" className="text-sm text-muted">
          Display name
        </label>
        <input
          id="displayName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="Anonymous Trader"
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={saveName}
          disabled={pending}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-elevated disabled:opacity-60"
        >
          Save
        </button>
      </div>
      <button
        type="button"
        onClick={() => toggle(false)}
        disabled={pending}
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        Leave leaderboard
      </button>
    </div>
  );
}
