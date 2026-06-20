import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, signOut } from "@/lib/auth";
import { getTradesForAnalytics } from "@/lib/db/analytics";
import {
  computeSummary,
  computeEquityCurve,
  computeDrawdown,
  computeDailyPnl,
  breakdownBySymbol,
  breakdownBySession,
  breakdownByTag,
} from "@/lib/analytics/metrics";
import { formatSignedCurrency } from "@/lib/format";
import { EquityChart } from "@/components/analytics/EquityChart";
import { DrawdownChart } from "@/components/analytics/DrawdownChart";
import { BreakdownBarChart } from "@/components/analytics/BreakdownBarChart";
import { CalendarHeatmap } from "@/components/analytics/CalendarHeatmap";

function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface/60 rounded-2xl border border-border p-5">
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg";
  hint?: string;
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
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function BreakdownTable({
  rows,
}: {
  rows: { key: string; pnl: number; trades: number }[];
}) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.key} className="border-border/60 border-b last:border-0">
            <td className="py-2 font-medium">{r.key}</td>
            <td className="py-2 text-right text-muted">{r.trades}</td>
            <td
              className={`py-2 text-right tabular-nums ${
                r.pnl >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {formatSignedCurrency(r.pnl)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trades = await getTradesForAnalytics(user.id);
  const summary = computeSummary(trades);
  const equity = computeEquityCurve(trades);
  const drawdown = computeDrawdown(equity);
  const daily = computeDailyPnl(trades);
  const bySymbol = breakdownBySymbol(trades);
  const bySession = breakdownBySession(trades);
  const byTag = breakdownByTag(trades);

  const pfDisplay =
    summary.profitFactor === null
      ? summary.grossProfit > 0
        ? "∞"
        : "—"
      : summary.profitFactor.toFixed(2);
  const rrDisplay =
    summary.avgRR === null ? "—" : `${summary.avgRR.toFixed(2)} : 1`;

  return (
    <div className="container-marketing py-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted">
            {user.email} · <span className="text-accent">{user.plan}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/trades"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Trades
          </Link>
          <Link
            href="/dashboard/settings"
            className="hover:border-accent/50 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
          >
            Settings
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="hover:border-accent/50 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {summary.totalTrades === 0 ? (
        <div className="bg-surface/60 mt-10 rounded-2xl border border-border p-12 text-center">
          <h2 className="text-lg font-semibold">No trades yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Log your first trade to see your PnL, win rate, equity curve, and
            performance breakdowns here.
          </p>
          <Link
            href="/dashboard/trades"
            className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Add your first trade
          </Link>
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard
              label="Total PnL"
              value={formatSignedCurrency(summary.totalPnl)}
              tone={summary.totalPnl >= 0 ? "pos" : "neg"}
            />
            <StatCard
              label="Win Rate"
              value={`${(summary.winRate * 100).toFixed(1)}%`}
              hint={`${summary.wins}W / ${summary.losses}L`}
            />
            <StatCard label="Profit Factor" value={pfDisplay} />
            <StatCard label="Avg R:R" value={rrDisplay} />
            <StatCard
              label="Total Trades"
              value={String(summary.totalTrades)}
              hint={`${summary.closedTrades} closed`}
            />
          </div>

          {/* Equity + drawdown */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card title="Equity Curve">
              {equity.length > 0 ? (
                <EquityChart data={equity} />
              ) : (
                <EmptyChart />
              )}
            </Card>
            <Card title="Drawdown">
              {drawdown.length > 0 ? (
                <DrawdownChart data={drawdown} />
              ) : (
                <EmptyChart />
              )}
            </Card>
          </div>

          {/* Calendar heatmap */}
          <div className="mt-4">
            <Card title="Daily PnL">
              {daily.length > 0 ? (
                <CalendarHeatmap data={daily} />
              ) : (
                <EmptyChart />
              )}
            </Card>
          </div>

          {/* Breakdowns */}
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <Card title="PnL by Symbol">
              {bySymbol.length > 0 ? (
                <BreakdownBarChart data={bySymbol} />
              ) : (
                <EmptyChart />
              )}
            </Card>
            <Card title="PnL by Session">
              {bySession.length > 0 ? (
                <BreakdownBarChart data={bySession} />
              ) : (
                <EmptyChart />
              )}
            </Card>
            <Card title="PnL by Strategy Tag">
              {byTag.length > 0 ? (
                <BreakdownTable rows={byTag} />
              ) : (
                <EmptyChart />
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-32 items-center justify-center text-sm text-muted">
      No closed trades yet.
    </div>
  );
}
