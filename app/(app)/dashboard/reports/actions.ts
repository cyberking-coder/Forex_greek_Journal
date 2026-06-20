"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { canUseAiReports } from "@/lib/plans";
import { getTradesForAnalytics } from "@/lib/db/analytics";
import { createAiReport } from "@/lib/db/reports";
import { buildStatsSummary } from "@/lib/ai/summary";
import { generateAiReport } from "@/lib/ai/report";
import { checkReportRateLimit } from "@/lib/ai/rate-limit";
import type { ReportActionResult } from "@/lib/ai/types";

const ALLOWED_PERIODS = new Set([7, 30, 90, 0]); // 0 = all time

export async function generateReportAction(
  periodDays: number,
): Promise<ReportActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
      code: "UNAUTHENTICATED",
    };
  }

  // Server-side plan gate.
  if (!canUseAiReports(user.plan)) {
    return {
      ok: false,
      error:
        "AI reports are available on the Pro and Elite plans. Upgrade to unlock.",
      code: "PLAN",
    };
  }

  // Anti-spam rate limit.
  const limit = await checkReportRateLimit(user.id, user.plan);
  if (!limit.ok) {
    return { ok: false, error: limit.error, code: "RATE_LIMIT" };
  }

  const days = ALLOWED_PERIODS.has(periodDays) ? periodDays : 30;
  const periodEnd = new Date();

  const allTrades = await getTradesForAnalytics(user.id);

  const periodStart =
    days === 0
      ? allTrades.length > 0
        ? new Date(allTrades[0]!.openTime)
        : periodEnd
      : new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000);

  const trades = allTrades.filter((t) => {
    const opened = new Date(t.openTime).getTime();
    return opened >= periodStart.getTime() && opened <= periodEnd.getTime();
  });

  const closed = trades.filter((t) => t.pnl !== null).length;
  if (closed < 1) {
    return {
      ok: false,
      error: "Not enough closed trades in this period to analyze.",
      code: "NO_DATA",
    };
  }

  const summary = buildStatsSummary(trades, periodStart, periodEnd);

  let content;
  try {
    content = await generateAiReport(summary);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "The AI report could not be generated.";
    return { ok: false, error: message, code: "AI_ERROR" };
  }

  const report = await createAiReport(user.id, {
    periodStart,
    periodEnd,
    grade: content.grade,
    summary: content.summary,
    contentJson: {
      strengths: content.strengths,
      weaknesses: content.weaknesses,
      blindSpots: content.blindSpots,
      actionPlan: content.actionPlan,
      stats: summary,
    },
  });

  revalidatePath("/dashboard/reports");
  return { ok: true, reportId: report.id };
}
