import Anthropic from "@anthropic-ai/sdk";
import type { AiStatsSummary } from "./summary";
import type { AiReportContent } from "./types";

// Model is fixed and server-side only. The API key is read from the
// environment and never exposed to the client.
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

const SYSTEM_PROMPT = `You are an elite trading performance coach reviewing a trader's statistics for a period.

You are given a STRUCTURED SUMMARY of their performance (not the raw trades). Analyze it like a coach: be specific, reference the numbers, and be honest but constructive. Pay attention to win rate, profit factor, expectancy, reward:risk, drawdown, streaks, time-of-day patterns, per-symbol / per-session / per-tag performance, and any signals of revenge trading (rapid re-entries after losses).

Respond with ONLY a JSON object, no markdown code fences, no prose before or after it, matching exactly:
{
  "grade": "A" | "B" | "C" | "D" | "F",
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "blindSpots": string[],
  "actionPlan": string[]
}

Rules:
- "grade" is a single capital letter A through F reflecting overall performance and discipline.
- "summary" is 2-4 sentences.
- Each list has 2-5 short, concrete items. "actionPlan" items are specific, actionable steps.
- Do not include any text outside the JSON. Do not wrap it in \`\`\` fences.`;

/** Builds the user prompt from the compact summary. */
export function buildReportPrompt(summary: AiStatsSummary): string {
  return [
    `Performance summary for ${summary.period.start} to ${summary.period.end} (${summary.period.days} days).`,
    "Analyze it and respond with the JSON object only.",
    "",
    JSON.stringify(summary, null, 2),
  ].join("\n");
}

/** Removes surrounding markdown code fences if the model added them. */
export function stripCodeFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();
  }
  return t;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/** Safely parses the model's response into structured content. Throws on invalid output. */
export function parseReportResponse(text: string): AiReportContent {
  const cleaned = stripCodeFences(text);

  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    // Fall back to extracting the first {...} block.
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The AI response was not valid JSON.");
    data = JSON.parse(match[0]);
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("The AI response was not a JSON object.");
  }
  const obj = data as Record<string, unknown>;

  const grade = String(obj.grade ?? "")
    .trim()
    .toUpperCase()
    .charAt(0);
  if (!/^[A-F]$/.test(grade)) {
    throw new Error("The AI response did not include a valid grade (A–F).");
  }

  return {
    grade,
    summary: typeof obj.summary === "string" ? obj.summary : "",
    strengths: toStringArray(obj.strengths),
    weaknesses: toStringArray(obj.weaknesses),
    blindSpots: toStringArray(obj.blindSpots),
    actionPlan: toStringArray(obj.actionPlan),
  };
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Calls Claude with the structured summary and returns parsed report content. */
export async function generateAiReport(
  summary: AiStatsSummary,
): Promise<AiReportContent> {
  if (!isAiConfigured()) {
    throw new Error(
      "AI reports are not configured. Set ANTHROPIC_API_KEY on the server.",
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildReportPrompt(summary) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("The AI returned no text content.");
  }
  return parseReportResponse(textBlock.text);
}
