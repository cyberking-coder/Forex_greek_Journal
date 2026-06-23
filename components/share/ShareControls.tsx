"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Download, ExternalLink, RefreshCw } from "lucide-react";
import {
  setPublicShareAction,
  regenerateShareTokenAction,
} from "@/app/(app)/dashboard/leaderboard/actions";
import type { ShareFormat } from "@/lib/share/card";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const FORMATS: { key: ShareFormat; label: string; ratio: string }[] = [
  { key: "post", label: "Post", ratio: "1:1" },
  { key: "story", label: "Story", ratio: "9:16" },
  { key: "landscape", label: "Landscape", ratio: "1.91:1" },
];

export function ShareControls({
  initialEnabled,
  initialToken,
}: {
  initialEnabled: boolean;
  initialToken: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [token, setToken] = useState(initialToken);
  const [format, setFormat] = useState<ShareFormat>("post");
  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = token ? `${origin}/share/${token}` : "";
  const cardUrl = token
    ? `${origin}/api/share-card?token=${token}&format=${format}`
    : "";

  function toggle(next: boolean) {
    startTransition(async () => {
      const res = await setPublicShareAction(next);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setEnabled(next);
      if (next && res.token) setToken(res.token);
      toast.success(
        next ? "Public sharing enabled." : "Public sharing disabled.",
      );
      router.refresh();
    });
  }

  function regenerate() {
    startTransition(async () => {
      const res = await regenerateShareTokenAction();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.token) setToken(res.token);
      toast.success("New link generated. The old link no longer works.");
      router.refresh();
    });
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — copy the link manually.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Public read-only link */}
      <section className="bg-surface/60 rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Public read-only link</h2>
            <p className="mt-1 text-sm text-muted">
              Anyone with the link can view your dashboard in view-only mode.
              Your email is never shown.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggle(!enabled)}
            disabled={pending}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
              enabled
                ? "border border-border bg-surface hover:bg-surface-elevated"
                : "bg-accent text-accent-foreground hover:bg-accent-hover",
            )}
          >
            {enabled ? "Disable" : "Enable sharing"}
          </button>
        </div>

        {enabled && token && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted outline-none"
              />
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Open
              </a>
            </div>
            <button
              type="button"
              onClick={regenerate}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground disabled:opacity-60"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              Regenerate link (invalidates the old one)
            </button>
          </div>
        )}
      </section>

      {/* Share card */}
      <section className="bg-surface/60 rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold">Share card</h2>
        <p className="mt-1 text-sm text-muted">
          Generate an image of your stats to post on social media.
        </p>

        {!enabled || !token ? (
          <p className="mt-4 rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
            Enable sharing above to generate a share card.
          </p>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFormat(f.key)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    f.key === format
                      ? "bg-accent text-accent-foreground"
                      : "border border-border bg-surface text-muted hover:text-foreground",
                  )}
                >
                  {f.label} <span className="opacity-60">{f.ratio}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-col items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={cardUrl}
                src={cardUrl}
                alt="Share card preview"
                className={cn(
                  "rounded-xl border border-border bg-background",
                  format === "story"
                    ? "max-h-[420px] w-auto"
                    : "w-full max-w-md",
                )}
              />
              <a
                href={cardUrl}
                download={`greek-journal-${format}.png`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download
              </a>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
