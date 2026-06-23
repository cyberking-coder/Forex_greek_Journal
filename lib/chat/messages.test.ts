import { describe, it, expect } from "vitest";
import { groupReactions } from "./messages";

describe("groupReactions", () => {
  it("counts reactions per emoji", () => {
    const result = groupReactions(
      [
        { emoji: "🔥", userId: "a" },
        { emoji: "🔥", userId: "b" },
        { emoji: "👍", userId: "c" },
      ],
      "z",
    );
    expect(result).toEqual([
      { emoji: "🔥", count: 2, mine: false },
      { emoji: "👍", count: 1, mine: false },
    ]);
  });

  it("flags the viewer's own reactions", () => {
    const result = groupReactions(
      [
        { emoji: "🔥", userId: "me" },
        { emoji: "🔥", userId: "b" },
        { emoji: "🚀", userId: "c" },
      ],
      "me",
    );
    expect(result.find((r) => r.emoji === "🔥")?.mine).toBe(true);
    expect(result.find((r) => r.emoji === "🚀")?.mine).toBe(false);
  });

  it("orders by count desc then emoji", () => {
    const result = groupReactions(
      [
        { emoji: "👍", userId: "a" },
        { emoji: "🔥", userId: "b" },
        { emoji: "🔥", userId: "c" },
        { emoji: "💯", userId: "d" },
      ],
      "z",
    );
    // 🔥 leads on count; the two singletons fall back to emoji ordering.
    expect(result[0]!.emoji).toBe("🔥");
    expect(result[0]!.count).toBe(2);
    expect(
      result
        .slice(1)
        .map((r) => r.emoji)
        .sort(),
    ).toEqual(["👍", "💯"].sort());
  });

  it("returns empty for no reactions", () => {
    expect(groupReactions([], "me")).toEqual([]);
  });
});
