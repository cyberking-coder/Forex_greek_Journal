/** Suggested strategy tags shown as quick-pick chips (free text still allowed). */
export const SUGGESTED_TAGS = [
  "Breakout",
  "Pullback",
  "Trend",
  "Reversal",
  "Range",
  "Scalp",
  "News",
  "Support/Resistance",
];

export type Mood = {
  key: string;
  label: string;
  emoji: string;
};

/** Mood options. Stored by `key` so they stay filterable. */
export const MOODS: Mood[] = [
  { key: "confident", label: "Confident", emoji: "😎" },
  { key: "calm", label: "Calm", emoji: "🧘" },
  { key: "neutral", label: "Neutral", emoji: "😐" },
  { key: "anxious", label: "Anxious", emoji: "😬" },
  { key: "greedy", label: "Greedy", emoji: "🤑" },
  { key: "fearful", label: "Fearful", emoji: "😨" },
  { key: "frustrated", label: "Frustrated", emoji: "😤" },
];

export function moodByKey(key: string | null | undefined): Mood | undefined {
  if (!key) return undefined;
  return MOODS.find((m) => m.key === key);
}
