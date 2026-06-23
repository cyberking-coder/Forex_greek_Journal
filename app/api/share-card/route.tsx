import { ImageResponse } from "next/og";
import { getUserByShareToken } from "@/lib/db/social";
import { getTradesForAnalytics } from "@/lib/db/analytics";
import {
  buildCardStats,
  parseFormat,
  FORMAT_SIZE,
  type CardStats,
} from "@/lib/share/card";

export const runtime = "nodejs";

function fmtCurrency(value: number): string {
  const abs = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value > 0 ? "+" : value < 0 ? "-" : ""}$${abs}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 26, color: "#9a9aae" }}>{label}</span>
      <span style={{ fontSize: 52, fontWeight: 700, color: "#e7e7ee" }}>
        {value}
      </span>
    </div>
  );
}

function Card({ stats, width }: { stats: CardStats; width: number }) {
  const pnlColor = stats.totalPnl >= 0 ? "#34d399" : "#f87171";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a0a0f",
        color: "#e7e7ee",
        padding: width > 1100 ? 64 : 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: "rgba(59,130,246,0.15)",
            color: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          G
        </div>
        <span style={{ fontSize: 30, fontWeight: 600 }}>Greek Journal</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontSize: 34, color: "#9a9aae" }}>{stats.name}</span>
        <span style={{ fontSize: 96, fontWeight: 800, color: pnlColor }}>
          {fmtCurrency(stats.totalPnl)}
        </span>
        <span style={{ fontSize: 28, color: "#9a9aae" }}>
          All-time realized PnL
        </span>
      </div>

      <div style={{ display: "flex", gap: 56 }}>
        <Stat label="Win Rate" value={`${(stats.winRate * 100).toFixed(1)}%`} />
        <Stat
          label="Profit Factor"
          value={
            stats.profitFactor === null
              ? stats.totalPnl > 0
                ? "∞"
                : "—"
              : stats.profitFactor.toFixed(2)
          }
        />
        <Stat label="Trades" value={String(stats.trades)} />
      </div>
    </div>
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const format = parseFormat(url.searchParams.get("format"));
  const size = FORMAT_SIZE[format];

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }
  const user = await getUserByShareToken(token);
  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const trades = await getTradesForAnalytics(user.id);
  const name = user.displayName || user.name || "Trader";
  const stats = buildCardStats(name, trades);

  return new ImageResponse(<Card stats={stats} width={size.width} />, {
    width: size.width,
    height: size.height,
  });
}
