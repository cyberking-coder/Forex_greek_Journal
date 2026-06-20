"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Polling fallback for "real-time" sync: triggers an incremental sync on mount
 * and then on an interval while the page is open. (MetaApi's streaming
 * websocket can replace this later behind the same /api/sync contract.)
 */
export function AutoSync({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const running = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (running.current) return;
      running.current = true;
      try {
        const res = await fetch("/api/sync", { method: "POST" });
        if (!cancelled && res.ok) router.refresh();
      } catch {
        // Network hiccup — the next tick will retry.
      } finally {
        running.current = false;
      }
    }

    run();
    const timer = setInterval(run, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs, router]);

  return null;
}
