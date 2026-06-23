export type ChatChannel = {
  id: string;
  name: string;
  description: string;
};

export const CHANNELS: ChatChannel[] = [
  {
    id: "general",
    name: "General",
    description: "Talk trading, life, anything.",
  },
  { id: "forex", name: "Forex", description: "Majors, minors, and exotics." },
  {
    id: "strategy",
    name: "Strategy",
    description: "Setups, systems, and ideas.",
  },
  {
    id: "wins",
    name: "Wins & Losses",
    description: "Share your trades — good and bad.",
  },
];

export const DEFAULT_CHANNEL = CHANNELS[0]!.id;

export function isValidChannel(id: string | null | undefined): boolean {
  return CHANNELS.some((c) => c.id === id);
}

/** Resolve an arbitrary channel id to a valid one, falling back to the default. */
export function resolveChannel(id: string | null | undefined): string {
  return isValidChannel(id) ? (id as string) : DEFAULT_CHANNEL;
}

/** Emojis users can react with. */
export const REACTION_EMOJIS = ["👍", "🔥", "💯", "🚀", "😂", "🎯"] as const;

export function isValidEmoji(emoji: string): boolean {
  return (REACTION_EMOJIS as readonly string[]).includes(emoji);
}
