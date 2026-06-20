/** Structured AI report content (also persisted in AiReport.contentJson). */
export type AiReportContent = {
  grade: string; // "A".."F"
  summary: string;
  strengths: string[];
  weaknesses: string[];
  blindSpots: string[];
  actionPlan: string[];
};

/** Result returned by the report server action. */
export type ReportActionResult =
  | { ok: true; reportId: string }
  | {
      ok: false;
      error: string;
      code?: "UNAUTHENTICATED" | "PLAN" | "RATE_LIMIT" | "NO_DATA" | "AI_ERROR";
    };
