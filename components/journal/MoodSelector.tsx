"use client";

import { MOODS } from "@/lib/journal/constants";
import { cn } from "@/lib/utils";

export function MoodSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => {
        const selected = value === mood.key;
        return (
          <button
            key={mood.key}
            type="button"
            onClick={() => onChange(selected ? null : mood.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              selected
                ? "bg-accent/15 border-accent text-foreground"
                : "hover:border-accent/50 border-border text-muted hover:text-foreground",
            )}
          >
            <span aria-hidden>{mood.emoji}</span>
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
