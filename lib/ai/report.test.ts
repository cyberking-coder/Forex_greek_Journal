import { describe, it, expect } from "vitest";
import {
  stripCodeFences,
  parseReportResponse,
  buildReportPrompt,
} from "./report";
import type { AiStatsSummary } from "./summary";

const validJson = JSON.stringify({
  grade: "B",
  summary: "Solid month.",
  strengths: ["Good risk control"],
  weaknesses: ["Overtrades London open"],
  blindSpots: ["Ignores swap costs"],
  actionPlan: ["Cut position size on Mondays"],
});

describe("stripCodeFences", () => {
  it("removes ```json fences", () => {
    expect(stripCodeFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it("removes bare ``` fences", () => {
    expect(stripCodeFences('```\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it("leaves unfenced text untouched", () => {
    expect(stripCodeFences('{"a":1}')).toBe('{"a":1}');
  });
});

describe("parseReportResponse", () => {
  it("parses clean JSON", () => {
    const r = parseReportResponse(validJson);
    expect(r.grade).toBe("B");
    expect(r.strengths).toEqual(["Good risk control"]);
    expect(r.actionPlan.length).toBe(1);
  });

  it("parses fenced JSON", () => {
    const r = parseReportResponse("```json\n" + validJson + "\n```");
    expect(r.grade).toBe("B");
  });

  it("extracts JSON embedded in prose", () => {
    const r = parseReportResponse(
      "Here is your report:\n" + validJson + "\nThanks!",
    );
    expect(r.grade).toBe("B");
  });

  it("normalizes grade to a single uppercase letter", () => {
    const r = parseReportResponse(JSON.stringify({ grade: "a", summary: "" }));
    expect(r.grade).toBe("A");
  });

  it("drops non-string list items", () => {
    const r = parseReportResponse(
      JSON.stringify({ grade: "C", strengths: ["ok", 5, null, "good"] }),
    );
    expect(r.strengths).toEqual(["ok", "good"]);
  });

  it("throws on an invalid grade", () => {
    expect(() => parseReportResponse(JSON.stringify({ grade: "Z" }))).toThrow();
  });

  it("throws on non-JSON", () => {
    expect(() => parseReportResponse("not json at all")).toThrow();
  });
});

describe("buildReportPrompt", () => {
  it("includes the period and serialized summary", () => {
    const summary = {
      period: { start: "2026-06-01", end: "2026-06-08", days: 7 },
    } as AiStatsSummary;
    const prompt = buildReportPrompt(summary);
    expect(prompt).toContain("2026-06-01");
    expect(prompt).toContain("2026-06-08");
    expect(prompt).toContain('"days": 7');
  });
});
