import "server-only";
import Pusher from "pusher";

/**
 * Real-time fan-out for chat. Backed by Pusher when the server credentials are
 * present; otherwise a no-op so the app still works via HTTP polling.
 */

let client: Pusher | null = null;

function getClient(): Pusher | null {
  if (!isRealtimeConfigured()) return null;
  if (!client) {
    client = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    });
  }
  return client;
}

export function isRealtimeConfigured(): boolean {
  return Boolean(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER,
  );
}

/** Pusher channel name for a lounge channel. */
export function pusherChannelName(channel: string): string {
  return `lounge-${channel}`;
}

export const NEW_MESSAGE_EVENT = "new-message";
export const REACTION_EVENT = "reaction";

/** Broadcast an event to a channel. Silently no-ops when Pusher isn't set up. */
export async function broadcast(
  channel: string,
  event: string,
  payload: unknown,
): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    await c.trigger(pusherChannelName(channel), event, payload);
  } catch {
    /* realtime is best-effort; polling will still deliver the update */
  }
}
