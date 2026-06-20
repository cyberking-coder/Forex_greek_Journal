"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { TradeFormModal } from "./TradeFormModal";
import { Modal } from "@/components/ui/Modal";
import type { SerializedTrade } from "@/lib/trades/types";
import { deleteTradeAction } from "@/app/(app)/dashboard/trades/actions";

export function TradeRowActions({ trade }: { trade: SerializedTrade }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTradeAction(trade.id);
      if (result.ok) {
        setConfirmOpen(false);
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          aria-label="Edit trade"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          aria-label="Delete trade"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <TradeFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trade={trade}
      />

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete trade"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Delete the{" "}
            <span className="font-medium text-foreground">{trade.symbol}</span>{" "}
            {trade.side.toLowerCase()} trade? This can&apos;t be undone.
          </p>
          {error && <p className="text-sm text-red-400">{error}</p>}
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
              onClick={handleDelete}
              disabled={pending}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
            >
              {pending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
