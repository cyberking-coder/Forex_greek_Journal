"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Send, SmilePlus } from "lucide-react";
import type { ChatChannel } from "@/lib/chat/channels";
import { REACTION_EMOJIS } from "@/lib/chat/channels";
import type { ChatMessageView } from "@/lib/chat/messages";
import {
  sendMessageAction,
  toggleReactionAction,
} from "@/app/(app)/dashboard/lounge/actions";
import { cn } from "@/lib/utils";

const POLL_MS = 4000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LoungeClient({
  channels,
  initialChannel,
  initialMessages,
  currentUserId,
  realtimeEnabled,
}: {
  channels: ChatChannel[];
  initialChannel: string;
  initialMessages: ChatMessageView[];
  currentUserId: string;
  realtimeEnabled: boolean;
}) {
  const [channel, setChannel] = useState(initialChannel);
  const [messages, setMessages] = useState<ChatMessageView[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [pickerFor, setPickerFor] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef(channel);
  channelRef.current = channel;

  const refresh = useCallback(async (ch: string) => {
    try {
      const res = await fetch(`/api/chat?channel=${encodeURIComponent(ch)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        channel: string;
        messages: ChatMessageView[];
      };
      // Ignore responses for a channel we've since switched away from.
      if (data.channel === channelRef.current) setMessages(data.messages);
    } catch {
      /* transient network error; next poll will retry */
    }
  }, []);

  // Refetch on channel switch.
  useEffect(() => {
    refresh(channel);
  }, [channel, refresh]);

  // Poll for new messages (fallback + realtime catch-up).
  useEffect(() => {
    const id = setInterval(() => refresh(channelRef.current), POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  // Optional Pusher realtime: refetch immediately on push events.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!realtimeEnabled || !key || !cluster) return;

    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pusher: any;
    import("pusher-js")
      .then(({ default: Pusher }) => {
        if (cancelled) return;
        pusher = new Pusher(key, { cluster });
        const sub = pusher.subscribe(`lounge-${channel}`);
        sub.bind("new-message", () => refresh(channel));
        sub.bind("reaction", () => refresh(channel));
      })
      .catch(() => {
        /* pusher-js unavailable; polling continues */
      });

    return () => {
      cancelled = true;
      if (pusher) pusher.disconnect();
    };
  }, [channel, realtimeEnabled, refresh]);

  // Keep the view pinned to the latest message.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function send() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    startTransition(async () => {
      const res = await sendMessageAction(channel, body);
      if (res.ok) {
        setMessages((prev) =>
          prev.some((m) => m.id === res.data.id) ? prev : [...prev, res.data],
        );
      } else {
        setDraft(body);
      }
    });
  }

  function react(messageId: string, emoji: string) {
    setPickerFor(null);
    startTransition(async () => {
      const res = await toggleReactionAction(messageId, emoji);
      if (res.ok) refresh(channelRef.current);
    });
  }

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-[200px_1fr]">
      {/* Channels */}
      <aside className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {channels.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setChannel(c.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors lg:w-full",
              c.id === channel
                ? "bg-accent/15 font-semibold text-accent"
                : "text-muted hover:bg-surface hover:text-foreground",
            )}
          >
            # {c.name}
          </button>
        ))}
      </aside>

      {/* Chat panel */}
      <div className="bg-surface/60 flex h-[60vh] min-h-[420px] flex-col rounded-2xl border border-border">
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              No messages yet. Say hello 👋
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.userId === currentUserId;
              return (
                <div key={m.id} className="group">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        mine ? "text-accent" : "text-foreground",
                      )}
                    >
                      {m.author}
                      {mine && (
                        <span className="ml-1 text-xs font-normal text-muted">
                          you
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted">
                      {formatTime(m.createdAt)}
                    </span>
                  </div>
                  <p className="text-foreground/90 mt-0.5 whitespace-pre-wrap break-words text-sm">
                    {m.body}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {m.reactions.map((r) => (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={() => react(m.id, r.emoji)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                          r.mine
                            ? "border-accent/50 bg-accent/15 text-accent"
                            : "border-border bg-surface text-muted hover:text-foreground",
                        )}
                      >
                        <span>{r.emoji}</span>
                        <span className="tabular-nums">{r.count}</span>
                      </button>
                    ))}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setPickerFor(pickerFor === m.id ? null : m.id)
                        }
                        className="inline-flex items-center rounded-full border border-transparent p-1 text-muted opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                        aria-label="Add reaction"
                      >
                        <SmilePlus className="h-4 w-4" aria-hidden />
                      </button>
                      {pickerFor === m.id && (
                        <div className="absolute z-10 mt-1 flex gap-1 rounded-lg border border-border bg-surface-elevated p-1.5 shadow-lg">
                          {REACTION_EMOJIS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => react(m.id, e)}
                              className="rounded px-1 text-lg transition-transform hover:scale-125"
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={`Message #${channel}`}
              maxLength={1000}
              className="max-h-32 min-h-[40px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
