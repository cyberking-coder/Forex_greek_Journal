"use server";

import { getCurrentUser } from "@/lib/auth";
import { canUseLounge } from "@/lib/plan";
import { createMessage, toggleReaction } from "@/lib/db/chat";
import {
  isValidChannel,
  isValidEmoji,
  REACTION_EMOJIS,
} from "@/lib/chat/channels";
import {
  broadcast,
  NEW_MESSAGE_EVENT,
  REACTION_EVENT,
} from "@/lib/chat/realtime";
import type { ChatMessageView } from "@/lib/chat/messages";

export type ChatActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function sendMessageAction(
  channel: string,
  body: string,
): Promise<ChatActionResult<ChatMessageView>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  if (!canUseLounge(user.plan)) {
    return { ok: false, error: "The Traders Lounge is an Elite feature." };
  }
  if (!isValidChannel(channel)) {
    return { ok: false, error: "Unknown channel." };
  }
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Message is empty." };

  const message = await createMessage(user.id, channel, trimmed);
  await broadcast(channel, NEW_MESSAGE_EVENT, message);
  return { ok: true, data: message };
}

export async function toggleReactionAction(
  messageId: string,
  emoji: string,
): Promise<ChatActionResult<{ active: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  if (!canUseLounge(user.plan)) {
    return { ok: false, error: "The Traders Lounge is an Elite feature." };
  }
  if (!isValidEmoji(emoji)) {
    return {
      ok: false,
      error: `Reaction must be one of ${REACTION_EMOJIS.join(" ")}`,
    };
  }

  const result = await toggleReaction(user.id, messageId, emoji);
  if (!result) return { ok: false, error: "Message not found." };

  await broadcast(result.channel, REACTION_EVENT, {
    messageId: result.messageId,
  });
  return { ok: true, data: { active: result.active } };
}
