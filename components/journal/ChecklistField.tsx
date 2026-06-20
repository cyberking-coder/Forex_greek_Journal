"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "@prisma/client";

export function ChecklistField({
  items,
  checked,
  onToggle,
}: {
  items: ChecklistItem[];
  checked: Record<string, boolean>;
  onToggle: (id: string, checked: boolean) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        No checklist items yet.{" "}
        <Link
          href="/dashboard/settings"
          className="text-accent hover:underline"
        >
          Define them in settings
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const isChecked = Boolean(checked[item.id]);
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onToggle(item.id, !isChecked)}
              className="hover:border-accent/40 flex w-full items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors"
            >
              <span
                className={cn(
                  "flex h-5 w-5 flex-none items-center justify-center rounded border transition-colors",
                  isChecked
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border",
                )}
              >
                {isChecked && <Check className="h-3.5 w-3.5" aria-hidden />}
              </span>
              <span className={isChecked ? "text-foreground" : "text-muted"}>
                {item.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
