import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cinematic placeholder for screenshots/mockups. Renders a self-contained
 * gradient panel with a faux browser chrome and a label, so layouts read as
 * finished before real imagery exists.
 */
export function PlaceholderImage({
  label,
  className,
  aspect = "aspect-[16/10]",
}: {
  label: string;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40",
        aspect,
        className,
      )}
      role="img"
      aria-label={`${label} preview placeholder`}
    >
      {/* Glow */}
      <div className="from-accent/15 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
      <div className="bg-accent/20 absolute -left-16 -top-16 h-48 w-48 rounded-full blur-3xl" />

      {/* Browser chrome */}
      <div className="border-border/80 bg-surface-elevated/60 relative flex items-center gap-2 border-b px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
        <span className="h-3 w-3 rounded-full bg-green-400/70" />
      </div>

      {/* Body */}
      <div className="bg-grid relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-elevated text-accent">
          <ImageIcon className="h-6 w-6" aria-hidden />
        </div>
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
    </div>
  );
}
