import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canUseAiReports } from "@/lib/plans";
import { listAiReports } from "@/lib/db/reports";
import { isAiConfigured } from "@/lib/ai/report";
import { formatDateTime } from "@/lib/format";
import { GenerateReportButton } from "@/components/reports/GenerateReportButton";
import { ReportCard } from "@/components/reports/ReportCard";
import { GradeBadge } from "@/components/reports/GradeBadge";

export const metadata = { title: "AI Reports" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const canGenerate = canUseAiReports(user.plan);
  const reports = await listAiReports(user.id);

  const selectedId =
    typeof searchParams.report === "string" ? searchParams.report : undefined;
  const selected =
    reports.find((r) => r.id === selectedId) ?? reports[0] ?? null;

  return (
    <div className="container-marketing py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            AI Performance Reports
          </h1>
          <p className="text-sm text-muted">
            An AI trading coach grades your performance and suggests what to
            work on next.
          </p>
        </div>
        <GenerateReportButton canGenerate={canGenerate} />
      </div>

      {canGenerate && !isAiConfigured() && (
        <p className="mt-4 text-xs text-muted">
          Note: <code>ANTHROPIC_API_KEY</code> is not set on the server, so
          generation will return a configuration error until it is added.
        </p>
      )}

      {reports.length === 0 ? (
        <div className="bg-surface/60 mt-8 rounded-2xl border border-border p-12 text-center">
          <h2 className="text-lg font-semibold">No reports yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            {canGenerate
              ? "Generate your first AI report to get a graded breakdown of your trading."
              : "Upgrade to Pro or Elite to unlock AI performance reports."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Selected report */}
          <div>{selected && <ReportCard report={selected} />}</div>

          {/* Past reports */}
          <aside>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              Past reports
            </h2>
            <ul className="space-y-2">
              {reports.map((report) => {
                const active = selected?.id === report.id;
                return (
                  <li key={report.id}>
                    <Link
                      href={`/dashboard/reports?report=${report.id}`}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                        active
                          ? "border-accent/50 bg-surface"
                          : "bg-surface/40 hover:border-accent/40 border-border"
                      }`}
                    >
                      <GradeBadge grade={report.grade ?? "?"} />
                      <span className="text-xs text-muted">
                        {formatDateTime(report.createdAt)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
