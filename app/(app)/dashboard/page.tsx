import Link from "next/link";
import { getCurrentUser, signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-3 max-w-sm text-muted">
          This is the protected app route group. Feature work lands here.
        </p>
      </div>

      {user && (
        <div className="bg-surface/60 rounded-xl border border-border px-6 py-4 text-sm">
          <p className="text-muted">
            Signed in as{" "}
            <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <p className="mt-1 text-muted">
            Plan: <span className="font-medium text-accent">{user.plan}</span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/trades"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          View Trades
        </Link>
        <Link
          href="/dashboard/settings"
          className="hover:border-accent/50 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
        >
          Settings
        </Link>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="hover:border-accent/50 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-elevated"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
