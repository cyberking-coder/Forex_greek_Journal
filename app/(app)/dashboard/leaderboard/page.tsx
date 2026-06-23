import Link from "next/link";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSocialSettings } from "@/lib/db/social";
import { getLeaderboard } from "@/lib/db/leaderboard";
import type {
  LeaderboardMetric,
  LeaderboardPeriod,
} from "@/lib/leaderboard/ranking";
import { formatSignedCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OptInControls } from "@/components/leaderboard/OptInControls";

export const metadata = { title: "Leaderboard — Greek Journal" };

type SearchParams = Record<string, string | string[] | undefined>;
function read(params: SearchParams, key: string): string | undefined {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

const PERIODS: LeaderboardPeriod[] = ["daily", "weekly", "monthly"];
const METRICS: { key: LeaderboardMetric; label: string }[] = [
  { key: "pnl", label: "PnL" },
  { key: "winRate", label: "Win Rate" },
];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const periodParam = read(searchParams, "period");
  const period: LeaderboardPeriod = PERIODS.includes(
    periodParam as LeaderboardPeriod,
  )
    ? (periodParam as LeaderboardPeriod)
    : "weekly";
  const metric: LeaderboardMetric =
    read(searchParams, "metric") === "winRate" ? "winRate" : "pnl";

  const [settings, rows] = await Promise.all([
    getSocialSettings(user.id),
    getLeaderboard(period, metric),
  ]);

  const tabClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      active
        ? "bg-accent text-accent-foreground"
        : "border border-border bg-surface text-muted hover:text-foreground",
    );

  return (
    <div className="container-marketing py-10">
      <Link
        href="/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Trophy className="h-6 w-6 text-accent" aria-hidden />
        Leaderboard
      </h1>

      <div className="mt-6">
        <OptInControls
          optedIn={settings?.leaderboardOptIn ?? false}
          displayName={settings?.displayName ?? ""}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/dashboard/leaderboard?period=${p}&metric=${metric}`}
              className={tabClass(p === period)}
            >
              {p[0]!.toUpperCase() + p.slice(1)}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <Link
              key={m.key}
              href={`/dashboard/leaderboard?period=${period}&metric=${m.key}`}
              className={tabClass(m.key === metric)}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Trader</th>
              <th className="px-4 py-3 text-right font-medium">PnL</th>
              <th className="px-4 py-3 text-right font-medium">Win Rate</th>
              <th className="px-4 py-3 text-right font-medium">Trades</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  No ranked traders for this period yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isMe = row.userId === user.id;
                return (
                  <tr
                    key={row.userId}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      isMe ? "bg-accent/10" : "hover:bg-surface/40",
                    )}
                  >
                    <td className="px-4 py-3 font-semibold">
                      {row.rank <= 3 ? ["🥇", "🥈", "🥉"][row.rank - 1] : row.rank}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {row.name}
                      {isMe && (
                        <span className="ml-2 text-xs text-accent">you</span>
                      )}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right tabular-nums",
                        row.pnl >= 0 ? "text-emerald-400" : "text-red-400",
                      )}
                    >
                      {formatSignedCurrency(row.pnl)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {(row.winRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">
                      {row.trades}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
