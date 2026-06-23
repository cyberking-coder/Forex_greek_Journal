export type ChatReactionView = {
  emoji: string;
  count: number;
  /** Whether the current viewer has reacted with this emoji. */
  mine: boolean;
};

export type ChatMessageView = {
  id: string;
  channel: string;
  userId: string;
  author: string;
  body: string;
  createdAt: string; // ISO
  reactions: ChatReactionView[];
};

export type RawReaction = { emoji: string; userId: string };

/**
 * Collapse raw per-user reactions into counts, flagging the ones the current
 * viewer made. Ordered by descending count, then emoji for stability.
 */
export function groupReactions(
  raw: RawReaction[],
  currentUserId: string,
): ChatReactionView[] {
  const counts = new Map<string, { count: number; mine: boolean }>();
  for (const r of raw) {
    const entry = counts.get(r.emoji) ?? { count: 0, mine: false };
    entry.count += 1;
    if (r.userId === currentUserId) entry.mine = true;
    counts.set(r.emoji, entry);
  }
  return [...counts.entries()]
    .map(([emoji, { count, mine }]) => ({ emoji, count, mine }))
    .sort((a, b) => b.count - a.count || a.emoji.localeCompare(b.emoji));
}
