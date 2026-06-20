"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConnectAccountForm } from "./ConnectAccountForm";

export function ConnectAccountButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Connect Account
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Connect Trading Account"
      >
        <ConnectAccountForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
