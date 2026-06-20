import type { AccountSyncStatus } from "@prisma/client";

const MAP: Record<AccountSyncStatus, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-surface-elevated text-muted" },
  DEPLOYING: { label: "Deploying", cls: "bg-accent/15 text-accent" },
  CONNECTED: { label: "Connected", cls: "bg-emerald-500/15 text-emerald-400" },
  SYNCING: { label: "Syncing", cls: "bg-accent/15 text-accent" },
  ERROR: { label: "Error", cls: "bg-red-500/15 text-red-400" },
  DISCONNECTED: {
    label: "Disconnected",
    cls: "bg-surface-elevated text-muted",
  },
};

export function SyncStatusBadge({ status }: { status: AccountSyncStatus }) {
  const s = MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
