import { CheckCircle2, AlertTriangle, EyeOff, ListChecks } from "lucide-react";
import type { AiReport } from "@prisma/client";
import { formatDateTime } from "@/lib/format";
import { GradeBadge } from "./GradeBadge";

type Lists = {
  strengths?: unknown;
  weaknesses?: unknown;
  blindSpots?: unknown;
  actionPlan?: unknown;
};

function asList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

function Section({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  tone: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3
        className={`mb-2 flex items-center gap-2 text-sm font-semibold ${tone}`}
      >
        {icon}
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground">
            <span className="mt-2 h-1 w-1 flex-none rounded-full bg-muted" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportCard({ report }: { report: AiReport }) {
  const content = (report.contentJson ?? {}) as Lists;
  const strengths = asList(content.strengths);
  const weaknesses = asList(content.weaknesses);
  const blindSpots = asList(content.blindSpots);
  const actionPlan = asList(content.actionPlan);

  return (
    <article className="bg-surface/60 rounded-2xl border border-border p-6">
      <header className="flex items-start gap-4">
        <GradeBadge grade={report.grade ?? "?"} size="lg" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            {formatDateTime(report.periodStart)} –{" "}
            {formatDateTime(report.periodEnd)}
          </p>
          <p className="mt-1 text-base leading-relaxed text-foreground">
            {report.summary}
          </p>
          <p className="mt-1 text-xs text-muted">
            Generated {formatDateTime(report.createdAt)}
          </p>
        </div>
      </header>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Section
          title="Strengths"
          items={strengths}
          tone="text-emerald-400"
          icon={<CheckCircle2 className="h-4 w-4" aria-hidden />}
        />
        <Section
          title="Weaknesses"
          items={weaknesses}
          tone="text-red-400"
          icon={<AlertTriangle className="h-4 w-4" aria-hidden />}
        />
        <Section
          title="Blind Spots"
          items={blindSpots}
          tone="text-amber-300"
          icon={<EyeOff className="h-4 w-4" aria-hidden />}
        />
        <Section
          title="Action Plan"
          items={actionPlan}
          tone="text-accent"
          icon={<ListChecks className="h-4 w-4" aria-hidden />}
        />
      </div>
    </article>
  );
}
