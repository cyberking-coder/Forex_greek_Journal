import { prisma } from "@/lib/db";
import { groupReactions, type ChatMessageView } from "@/lib/chat/messages";

const MAX_BODY = 1000;
const WINDOW = 50;

function authorName(user: {
  id: string;
  displayName: string | null;
  name: string | null;
}): string {
  return user.displayName || user.name || `Trader ${user.id.slice(-4)}`;
}

type MessageRow = {
  id: string;
  channel: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { id: string; displayName: string | null; name: string | null };
  reactions: { emoji: string; userId: string }[];
};

function toView(row: MessageRow, viewerId: string): ChatMessageView {
  return {
    id: row.id,
    channel: row.channel,
    userId: row.userId,
    author: authorName(row.user),
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    reactions: groupReactions(row.reactions, viewerId),
  };
}

const messageInclude = {
  user: { select: { id: true, displayName: true, name: true } },
  reactions: { select: { emoji: true, userId: true } },
} as const;

/** Most recent messages in a channel, oldest-first, shaped for the viewer. */
export async function getMessages(
  channel: string,
  viewerId: string,
): Promise<ChatMessageView[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { channel },
    orderBy: { createdAt: "desc" },
    take: WINDOW,
    include: messageInclude,
  });
  return rows.reverse().map((r) => toView(r as MessageRow, viewerId));
}

/** Persist a new message and return its view. */
export async function createMessage(
  userId: string,
  channel: string,
  body: string,
): Promise<ChatMessageView> {
  const row = await prisma.chatMessage.create({
    data: { userId, channel, body: body.slice(0, MAX_BODY) },
    include: messageInclude,
  });
  return toView(row as MessageRow, userId);
}

/**
 * Toggle a viewer's reaction on a message. Returns the message's channel and
 * id so callers can broadcast, plus whether the reaction is now active.
 */
export async function toggleReaction(
  userId: string,
  messageId: string,
  emoji: string,
): Promise<{ channel: string; messageId: string; active: boolean } | null> {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { channel: true },
  });
  if (!message) return null;

  const existing = await prisma.chatReaction.findUnique({
    where: {
      messageId_userId_emoji: { messageId, userId, emoji },
    },
  });

  if (existing) {
    await prisma.chatReaction.delete({ where: { id: existing.id } });
    return { channel: message.channel, messageId, active: false };
  }

  await prisma.chatReaction.create({
    data: { messageId, userId, emoji },
  });
  return { channel: message.channel, messageId, active: true };
}
