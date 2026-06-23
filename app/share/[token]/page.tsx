import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, LineChart } from "lucide-react";
import { getUserByShareToken } from "@/lib/db/social";
import { getTradesForAnalytics } from "@/lib/db/analytics";
import {
  computeSummary,
  computeEquityCurve,
  computeDrawdown,
  computeDailyPnl,
  breakdownBySymbol,
} from "@/lib/analytics/metrics";
import { formatSignedCurrency } from "@/lib/format";
import { EquityChart } from "@/components/analytics/EquityChart";
import { DrawdownChart } from "@/components/analytics/DrawdownChart";
import { BreakdownBarChart } from "@/components/analytics/BreakdownBarChart";
import { CalendarHeatmap } from "@/components/analytics/CalendarHeatmap";

export const metadata = {
  title: "Shared Performance — Greek Journal",
  robots: { index: false },
};

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg";
}) {
  const color =
    tone === "pos"
      ? "text-emerald-400"
      : tone === "neg"
        ? "text-red-400"
        : "text-foreground";
  return (
    <div className="bg-surface/60 rounded-2xl border border-border p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

export default async function SharedDashboardPage({
  params,
}: {
  params: { token: string };
}) {
  const user = await getUserByShareToken(params.token);
  if (!user) notFound();

  const trades = await getTradesForAnalytics(user.id);
  const summary = computeSummary(trades);
  const equity = computeEquityCurve(trades);
  const drawdown = computeDrawdown(equity);
  const daily = computeDailyPnl(trades);
  const bySymbol = breakdownBySymbol(trades);
  const name = user.displayName || user.name || "A trader";

  const pf =
    summary.profitFactor === null
      ? summary.grossProfit > 0
        ? "∞"
        : "—"
      : summary.profitFactor.toFixed(2);

  return (
    <div className="container-marketing py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Eye className="h-3.5 w-3.5" aria-hidden /> View-only
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {name}&apos;s performance
          </h1>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          <span className="bg-accent/15 flex h-8 w-8 items-center justify-center rounded-lg text-accent">
            <LineChart className="h-5 w-5" aria-hidden />
          </span>
          Greek Journal
        </Link>
      </div>

      {summary.totalTrades === 0 ? (
        <div className="bg-surface/60 mt-8 rounded-2xl border border-border p-12 text-center text-muted">
          No trades shared yet.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total PnL"
              value={formatSignedCurrency(summary.totalPnl)}
              tone={summary.totalPnl >= 0 ? "pos" : "neg"}
            />
            <StatCard
              label="Win Rate"
              value={`${(summary.winRate * 100).toFixed(1)}%`}
            />
            <StatCard label="Profit Factor" value={pf} />
            <StatCard label="Trades" value={String(summary.closedTrades)} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="bg-surface/60 rounded-2xl border border-border p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Equity Curve
              </h2>
              {equity.length > 0 ? (
                <EquityChart data={equity} />
              ) : (
                <p className="py-8 text-center text-sm text-muted">
                  No closed trades yet.
                </p>
              )}
            </div>
            <div className="bg-surface/60 rounded-2xl border border-border p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Drawdown
              </h2>
              {drawdown.length > 0 ? (
                <DrawdownChart data={drawdown} />
              ) : (
                <p className="py-8 text-center text-sm text-muted">
                  No closed trades yet.
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="bg-surface/60 rounded-2xl border border-border p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Daily PnL
              </h2>
              {daily.length > 0 ? (
                <CalendarHeatmap data={daily} />
              ) : (
                <p className="py-8 text-center text-sm text-muted">
                  No closed trades yet.
                </p>
              )}
            </div>
            <div className="bg-surface/60 rounded-2xl border border-border p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                PnL by Symbol
              </h2>
              {bySymbol.length > 0 ? (
                <BreakdownBarChart data={bySymbol} />
              ) : (
                <p className="py-8 text-center text-sm text-muted">
                  No closed trades yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
