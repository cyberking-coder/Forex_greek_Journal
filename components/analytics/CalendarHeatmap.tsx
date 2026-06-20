import type { DailyPnl } from "@/lib/analytics/types";
import { formatSignedCurrency } from "@/lib/format";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_WEEKS = 53;

function parseUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function cellColor(pnl: number | undefined, maxAbs: number): string {
  if (pnl === undefined) return "rgba(255,255,255,0.05)";
  if (pnl === 0) return "rgba(255,255,255,0.12)";
  const intensity = maxAbs > 0 ? 0.25 + 0.75 * (Math.abs(pnl) / maxAbs) : 0.5;
  return pnl > 0
    ? `rgba(52,211,153,${intensity.toFixed(2)})`
    : `rgba(248,113,113,${intensity.toFixed(2)})`;
}

/** GitHub-style heatmap of daily PnL (UTC days), green for up, red for down. */
export function CalendarHeatmap({ data }: { data: DailyPnl[] }) {
  if (data.length === 0) return null;

  const byDay = new Map(data.map((d) => [d.date, d.pnl]));
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.pnl)), 0);

  // Range: earliest day → today, aligned so each column is a Sun–Sat week.
  const first = parseUtc(data[0]!.date);
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // back to Sunday
  const end = new Date();

  const weeks: { date: string; pnl: number | undefined }[][] = [];
  let cursor = start.getTime();
  while (cursor <= end.getTime()) {
    const week: { date: string; pnl: number | undefined }[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = new Date(cursor).toISOString().slice(0, 10);
      week.push({ date: iso, pnl: byDay.get(iso) });
      cursor += DAY_MS;
    }
    weeks.push(week);
  }
  const trimmed = weeks.slice(-MAX_WEEKS);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1">
          {trimmed.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className="h-3.5 w-3.5 rounded-sm"
                  style={{ backgroundColor: cellColor(day.pnl, maxAbs) }}
                  title={
                    day.pnl !== undefined
                      ? `${day.date}: ${formatSignedCurrency(day.pnl)}`
                      : `${day.date}: no trades`
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <span>Loss</span>
        <span
          className="h-3 w-3 rounded-sm"
          style={{ background: "rgba(248,113,113,0.9)" }}
        />
        <span
          className="h-3 w-3 rounded-sm"
          style={{ background: "rgba(255,255,255,0.12)" }}
        />
        <span
          className="h-3 w-3 rounded-sm"
          style={{ background: "rgba(52,211,153,0.9)" }}
        />
        <span>Profit</span>
      </div>
    </div>
  );
}
