"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { toDatetimeLocalValue } from "@/lib/format";
import type { SerializedTrade, ActionResult } from "@/lib/trades/types";
import {
  createTradeAction,
  updateTradeAction,
} from "@/app/(app)/dashboard/trades/actions";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent";
const labelClass = "mb-1.5 block text-sm font-medium";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className={labelClass}>{label}</span>
      {children}
    </div>
  );
}

export function TradeFormModal({
  open,
  onClose,
  trade,
}: {
  open: boolean;
  onClose: () => void;
  trade?: SerializedTrade;
}) {
  const router = useRouter();
  const isEdit = Boolean(trade);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLimitReached(false);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    startTransition(async () => {
      const result: ActionResult = isEdit
        ? await updateTradeAction(trade!.id, payload)
        : await createTradeAction(payload);

      if (result.ok) {
        onClose();
        router.refresh();
        return;
      }
      if (result.code === "LIMIT_REACHED") {
        setLimitReached(true);
      }
      setError(result.error);
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Trade" : "Add Trade"}
    >
      {limitReached ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted">{error}</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/#pricing"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Upgrade to Pro
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Symbol">
              <input
                name="symbol"
                required
                placeholder="EURUSD"
                defaultValue={trade?.symbol ?? ""}
                className={`${inputClass} uppercase`}
              />
            </Field>
            <Field label="Side">
              <select
                name="side"
                required
                defaultValue={trade?.side ?? "BUY"}
                className={inputClass}
              >
                <option value="BUY">Buy</option>
                <option value="SELL">Sell</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Volume (lots)">
              <input
                name="volume"
                type="number"
                step="any"
                min="0"
                required
                placeholder="1.0"
                defaultValue={trade?.volume ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Open Price">
              <input
                name="openPrice"
                type="number"
                step="any"
                min="0"
                required
                placeholder="1.08500"
                defaultValue={trade?.openPrice ?? ""}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Open Time">
              <input
                name="openTime"
                type="datetime-local"
                required
                defaultValue={toDatetimeLocalValue(
                  trade?.openTime ?? new Date(),
                )}
                className={inputClass}
              />
            </Field>
            <Field label="Close Time">
              <input
                name="closeTime"
                type="datetime-local"
                defaultValue={toDatetimeLocalValue(trade?.closeTime ?? null)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Close Price">
              <input
                name="closePrice"
                type="number"
                step="any"
                min="0"
                placeholder="Leave blank if open"
                defaultValue={trade?.closePrice ?? ""}
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stop Loss">
                <input
                  name="stopLoss"
                  type="number"
                  step="any"
                  min="0"
                  defaultValue={trade?.stopLoss ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Take Profit">
                <input
                  name="takeProfit"
                  type="number"
                  step="any"
                  min="0"
                  defaultValue={trade?.takeProfit ?? ""}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Commission">
              <input
                name="commission"
                type="number"
                step="any"
                placeholder="0"
                defaultValue={trade?.commission ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Swap">
              <input
                name="swap"
                type="number"
                step="any"
                placeholder="0"
                defaultValue={trade?.swap ?? ""}
                className={inputClass}
              />
            </Field>
          </div>

          <p className="text-xs text-muted">
            PnL is auto-calculated on save when a close price is provided.
          </p>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? "Saving..." : isEdit ? "Save changes" : "Add trade"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
