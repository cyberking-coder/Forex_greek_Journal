import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTradeWithJournal, getUsedTags } from "@/lib/db/journal";
import { listChecklistItems } from "@/lib/db/checklist";
import { serializeJournal } from "@/lib/journal/types";
import {
  formatDateTime,
  formatNumber,
  formatSignedCurrency,
} from "@/lib/format";
import { JournalPanel } from "@/components/journal/JournalPanel";

export const metadata = { title: "Trade detail" };

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium tabular-nums">{value}</span>
    </div>
  );
}

export default async function TradeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const trade = await getTradeWithJournal(user.id, params.id);
  if (!trade) notFound();

  const [checklistItems, usedTags] = await Promise.all([
    listChecklistItems(user.id),
    getUsedTags(user.id),
  ]);
  const journal = serializeJournal(trade.journalEntry);

  return (
    <div className="container-marketing py-10">
      <Link
        href="/dashboard/trades"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Trades
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {trade.symbol}
        </h1>
        <span
          className={
            trade.side === "BUY"
              ? "rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-sm font-medium text-emerald-400"
              : "rounded-full bg-red-500/15 px-2.5 py-0.5 text-sm font-medium text-red-400"
          }
        >
          {trade.side}
        </span>
        <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs font-medium text-muted">
          {trade.source === "MANUAL" ? "Manual" : "Sync"}
        </span>
        {trade.pnl !== null && (
          <span
            className={
              trade.pnl >= 0
                ? "text-lg font-semibold text-emerald-400"
                : "text-lg font-semibold text-red-400"
            }
          >
            {formatSignedCurrency(trade.pnl)}
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Trade details */}
        <aside className="lg:col-span-1">
          <div className="bg-surface/60 rounded-2xl border border-border p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
              Trade details
            </h2>
            <div className="divide-border/60 divide-y">
              <Stat label="Volume" value={formatNumber(trade.volume, 2)} />
              <Stat label="Open price" value={formatNumber(trade.openPrice)} />
              <Stat
                label="Close price"
                value={
                  trade.closePrice !== null
                    ? formatNumber(trade.closePrice)
                    : "—"
                }
              />
              <Stat label="Open time" value={formatDateTime(trade.openTime)} />
              <Stat
                label="Close time"
                value={formatDateTime(trade.closeTime)}
              />
              <Stat
                label="Stop loss"
                value={
                  trade.stopLoss !== null ? formatNumber(trade.stopLoss) : "—"
                }
              />
              <Stat
                label="Take profit"
                value={
                  trade.takeProfit !== null
                    ? formatNumber(trade.takeProfit)
                    : "—"
                }
              />
              <Stat
                label="Commission"
                value={formatNumber(trade.commission, 2)}
              />
              <Stat label="Swap" value={formatNumber(trade.swap, 2)} />
            </div>
          </div>
        </aside>

        {/* Journal */}
        <div className="lg:col-span-2">
          <div className="bg-surface/60 rounded-2xl border border-border p-6">
            <h2 className="mb-5 text-lg font-semibold">Journal</h2>
            <JournalPanel
              tradeId={trade.id}
              initial={journal}
              checklistItems={checklistItems}
              usedTags={usedTags}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
