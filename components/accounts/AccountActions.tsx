"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  syncAccountAction,
  disconnectAccountAction,
} from "@/app/(app)/dashboard/accounts/actions";

export function AccountActions({ id, broker }: { id: string; broker: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function sync() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await syncAccountAction(id);
      if (result.ok) {
        setMessage(result.message ?? "Synced.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function disconnect() {
    startTransition(async () => {
      await disconnectAccountAction(id);
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={sync}
          disabled={pending}
          className="hover:border-accent/50 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:bg-surface-elevated disabled:opacity-60"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`}
            aria-hidden
          />
          Sync now
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Disconnect account"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {message && <span className="text-xs text-emerald-400">{message}</span>}
      {error && (
        <span className="max-w-xs text-right text-xs text-red-400">
          {error}
        </span>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Disconnect account"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Disconnect{" "}
            <span className="font-medium text-foreground">{broker}</span>?
            Synced trades are kept in your journal, but new deals will stop
            importing.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={disconnect}
              disabled={pending}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {pending ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
