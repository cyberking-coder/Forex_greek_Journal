import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";
export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a0a0f",
        color: "#e7e7ee",
        padding: 80,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "rgba(59,130,246,0.15)",
            color: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            fontWeight: 800,
          }}
        >
          G
        </div>
        <span style={{ fontSize: 34, fontWeight: 600 }}>{siteConfig.name}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span
          style={{
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          Track Trades. Analyze PnL. Master Markets.
        </span>
        <span style={{ fontSize: 30, color: "#9a9aae", maxWidth: 900 }}>
          The trading journal for forex traders — sync MT4/MT5, journal every
          trade, and get AI-powered performance reports.
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, color: "#34d399", fontSize: 26 }}>
        <span>Equity curves</span>
        <span style={{ color: "#3b3b4a" }}>•</span>
        <span>Win-rate analytics</span>
        <span style={{ color: "#3b3b4a" }}>•</span>
        <span>AI reports</span>
      </div>
    </div>,
    size,
  );
}
