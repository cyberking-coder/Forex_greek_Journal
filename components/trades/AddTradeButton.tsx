"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TradeFormModal } from "./TradeFormModal";

export function AddTradeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add Trade
      </button>
      <TradeFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
