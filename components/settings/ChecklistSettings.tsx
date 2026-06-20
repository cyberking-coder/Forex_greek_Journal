"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { ChecklistItem } from "@prisma/client";
import {
  addChecklistItemAction,
  deleteChecklistItemAction,
} from "@/app/(app)/dashboard/settings/actions";

export function ChecklistSettings({ items }: { items: ChecklistItem[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const label = String(new FormData(e.currentTarget).get("label") ?? "");
    startTransition(async () => {
      const result = await addChecklistItemAction({ label });
      if (result.ok) {
        formRef.current?.reset();
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteChecklistItemAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-muted">
          No checklist items yet. Add the rules you want to confirm before every
          trade.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <span className="text-sm">{item.label}</span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                disabled={pending}
                aria-label={`Delete ${item.label}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} onSubmit={handleAdd} className="flex gap-2">
        <input
          name="label"
          required
          maxLength={120}
          placeholder="e.g. Confirmed trend on higher timeframe"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
