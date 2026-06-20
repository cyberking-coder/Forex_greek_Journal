"use client";

import { SUGGESTED_TAGS } from "@/lib/journal/constants";
import { cn } from "@/lib/utils";

export function StrategyTagInput({
  value,
  onChange,
  usedTags = [],
}: {
  value: string;
  onChange: (value: string) => void;
  usedTags?: string[];
}) {
  // Merge user's previous tags with the static suggestions, de-duplicated.
  const suggestions = Array.from(new Set([...usedTags, ...SUGGESTED_TAGS]));

  return (
    <div className="space-y-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Breakout"
        maxLength={60}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
      />
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((tag) => {
          const selected = value.trim().toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(selected ? "" : tag)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                selected
                  ? "bg-accent/15 border-accent text-foreground"
                  : "hover:border-accent/50 border-border text-muted hover:text-foreground",
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
