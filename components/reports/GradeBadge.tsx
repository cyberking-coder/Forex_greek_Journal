const GRADE_STYLE: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  B: "bg-teal-500/15 text-teal-300 border-teal-500/40",
  C: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  D: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  F: "bg-red-500/15 text-red-400 border-red-500/40",
};

export function GradeBadge({
  grade,
  size = "md",
}: {
  grade: string;
  size?: "md" | "lg";
}) {
  const style =
    GRADE_STYLE[grade] ?? "bg-surface-elevated text-muted border-border";
  const dims = size === "lg" ? "h-16 w-16 text-3xl" : "h-10 w-10 text-lg";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl border font-bold ${dims} ${style}`}
      aria-label={`Grade ${grade}`}
    >
      {grade}
    </span>
  );
}
