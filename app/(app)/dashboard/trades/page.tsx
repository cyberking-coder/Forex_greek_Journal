import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listTrades, countTradesInCurrentMonth } from "@/lib/db/trades";
import { serializeTrade } from "@/lib/trades/types";
import { tradeLimitFor } from "@/lib/plans";
import {
  formatDateTime,
  formatNumber,
  formatSignedCurrency,
} from "@/lib/format";
import { AddTradeButton } from "@/components/trades/AddTradeButton";
import { TradesFilters } from "@/components/trades/TradesFilters";
import { TradeRowActions } from "@/components/trades/TradeRowActions";
import type { TradeSide } from "@prisma/client";

const PAGE_SIZE = 10;

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(params: SearchParams, key: string): string | undefined {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const page = Math.max(1, Number(readParam(searchParams, "page")) || 1);
  const symbol = readParam(searchParams, "symbol")?.trim() || undefined;
  const sideParam = readParam(searchParams, "side");
  const side: TradeSide | undefined =
    sideParam === "BUY" || sideParam === "SELL" ? sideParam : undefined;
  const order = readParam(searchParams, "order") === "asc" ? "asc" : "desc";

  const { trades, total, pageCount } = await listTrades(user.id, {
    page,
    pageSize: PAGE_SIZE,
    symbol,
    side,
    order,
  });
  const rows = trades.map(serializeTrade);

  const limit = tradeLimitFor(user.plan);
  const used = limit !== null ? await countTradesInCurrentMonth(user.id) : 0;
  const limitReached = limit !== null && used >= limit;

  // Preserve filters when building sort/pagination links.
  const baseParams = new URLSearchParams();
  if (symbol) baseParams.set("symbol", symbol);
  if (side) baseParams.set("side", side);

  const sortParams = new URLSearchParams(baseParams);
  sortParams.set("order", order === "asc" ? "desc" : "asc");
  const sortHref = `/dashboard/trades?${sortParams.toString()}`;

  const pageHref = (p: number) => {
    const sp = new URLSearchParams(baseParams);
    if (order === "asc") sp.set("order", "asc");
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/dashboard/trades?${qs}` : "/dashboard/trades";
  };

  return (
    <div className="container-marketing py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Trades</h1>
          <p className="text-sm text-muted">
            {total} {total === 1 ? "trade" : "trades"} logged
            {limit !== null && (
              <>
                {" · "}
                <span className={limitReached ? "text-red-400" : undefined}>
                  {used} / {limit} this month
                </span>
              </>
            )}
          </p>
        </div>
        <AddTradeButton />
      </div>

      {/* Upgrade banner */}
      {limitReached && (
        <div className="border-accent/40 bg-accent/10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <p className="text-sm">
            You&apos;ve reached the Free plan limit of {limit} trades this
            month.
          </p>
          <Link
            href="/#pricing"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Upgrade to Pro
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6">
        <TradesFilters />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="bg-surface/60 border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 font-medium">
                <Link
                  href={sortHref}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Open Time
                  {order === "asc" ? (
                    <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  )}
                </Link>
              </th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Side</th>
              <th className="px-4 py-3 text-right font-medium">Volume</th>
              <th className="px-4 py-3 text-right font-medium">Open</th>
              <th className="px-4 py-3 text-right font-medium">Close</th>
              <th className="px-4 py-3 text-right font-medium">PnL</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-muted">
                  No trades found. Add your first trade to get started.
                </td>
              </tr>
            ) : (
              rows.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-border/60 hover:bg-surface/40 border-b last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDateTime(trade.openTime)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link
                      href={`/dashboard/trades/${trade.id}`}
                      className="transition-colors hover:text-accent"
                    >
                      {trade.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        trade.side === "BUY"
                          ? "font-medium text-emerald-400"
                          : "font-medium text-red-400"
                      }
                    >
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatNumber(trade.volume, 2)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatNumber(trade.openPrice)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {trade.closePrice !== null
                      ? formatNumber(trade.closePrice)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {trade.pnl === null ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span
                        className={
                          trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        {formatSignedCurrency(trade.pnl)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        trade.source === "MANUAL"
                          ? "bg-surface-elevated text-muted"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {trade.source === "MANUAL" ? "Manual" : "Sync"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <TradeRowActions trade={trade} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-surface-elevated"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-muted opacity-50">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Prev
              </span>
            )}
            {page < pageCount ? (
              <Link
                href={pageHref(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 transition-colors hover:bg-surface-elevated"
              >
                Next <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-muted opacity-50">
                Next <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
