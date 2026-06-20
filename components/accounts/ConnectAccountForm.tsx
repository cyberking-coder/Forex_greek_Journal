"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck } from "lucide-react";
import { connectAccountAction } from "@/app/(app)/dashboard/accounts/actions";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent";
const labelClass = "mb-1.5 block text-sm font-medium";

export function ConnectAccountForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const payload = Object.fromEntries(new FormData(e.currentTarget).entries());
    startTransition(async () => {
      const result = await connectAccountAction(payload);
      if (result.ok) {
        onDone();
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
        <p>
          Use your <strong>investor (read-only) password</strong>. This
          connection can view trade history only — it can never place, modify,
          or close trades.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="broker" className={labelClass}>
            Broker name
          </label>
          <input
            id="broker"
            name="broker"
            required
            placeholder="My Broker"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="platform" className={labelClass}>
            Platform
          </label>
          <select
            id="platform"
            name="platform"
            defaultValue="MT5"
            className={inputClass}
          >
            <option value="MT5">MetaTrader 5</option>
            <option value="MT4">MetaTrader 4</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="server" className={labelClass}>
          Server name
        </label>
        <input
          id="server"
          name="server"
          required
          placeholder="ICMarketsSC-Demo"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="login" className={labelClass}>
            Login
          </label>
          <input
            id="login"
            name="login"
            required
            placeholder="1234567"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>
            Investor password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="off"
              placeholder="Read-only password"
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Connecting…" : "Connect account"}
        </button>
      </div>
    </form>
  );
}
