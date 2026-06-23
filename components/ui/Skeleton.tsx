import { cn } from "@/lib/utils";

/** Animated placeholder block. Decorative — hidden from assistive tech. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-elevated", className)}
      aria-hidden
    />
  );
}

/** A labelled stat card placeholder used on the dashboard. */
export function StatCardSkeleton() {
  return (
    <div className="bg-surface/60 rounded-2xl border border-border p-5">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-7 w-28" />
    </div>
  );
}

/** A chart-sized panel placeholder. */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className="bg-surface/60 rounded-2xl border border-border p-5">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={cn("mt-4 h-48 w-full", className)} />
    </div>
  );
}

/** Table-row placeholders for list views. */
export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="bg-surface/60 border-b border-border px-4 py-3">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="divide-border/60 divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
