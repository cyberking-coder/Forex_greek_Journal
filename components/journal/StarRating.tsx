"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const active = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(value === star ? null : star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-6 w-6",
              star <= active ? "fill-amber-400 text-amber-400" : "text-border",
            )}
          />
        </button>
      ))}
      {value !== null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-2 text-xs text-muted transition-colors hover:text-foreground"
        >
          Clear
        </button>
      )}
    </div>
  );
}
