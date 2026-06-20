"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

export function TradesFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const symbol = params.get("symbol") ?? "";
  const side = params.get("side") ?? "";

  function apply(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) sp.set(key, value);
      else sp.delete(key);
    }
    // Any filter change resets pagination.
    sp.delete("page");
    router.push(`/dashboard/trades?${sp.toString()}`);
  }

  const hasFilters = Boolean(symbol || side);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const value = String(new FormData(e.currentTarget).get("symbol") ?? "");
        apply({ symbol: value.trim() });
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="symbol"
          defaultValue={symbol}
          placeholder="Filter by symbol"
          className="w-48 rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </div>

      <select
        value={side}
        onChange={(e) => apply({ side: e.target.value })}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
      >
        <option value="">All sides</option>
        <option value="BUY">Buy</option>
        <option value="SELL">Sell</option>
      </select>

      <button
        type="submit"
        className="hover:border-accent/50 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
      >
        Apply
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={() => apply({ symbol: "", side: "" })}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
          Clear
        </button>
      )}
    </form>
  );
}
