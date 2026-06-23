import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserById } from "@/lib/db/billing";
import { isBillingConfigured, type Interval } from "@/lib/billing/config";
import { formatDateTime } from "@/lib/format";
import { PlanSelector } from "@/components/billing/PlanSelector";
import { ManageBillingButton } from "@/components/billing/ManageBillingButton";

export const metadata = { title: "Billing — Greek Journal" };

type SearchParams = Record<string, string | string[] | undefined>;
function readParam(params: SearchParams, key: string): string | undefined {
  const v = params[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login");

  const user = await getUserById(sessionUser.id);
  if (!user) redirect("/login");

  const configured = isBillingConfigured();
  const success = readParam(searchParams, "status") === "success";
  const interval: Interval =
    readParam(searchParams, "interval") === "yearly" ? "yearly" : "monthly";

  return (
    <div className="container-marketing py-10">
      <Link
        href="/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">
        Plan &amp; Billing
      </h1>

      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden />
          Payment received. Your plan unlocks as soon as the confirmation
          webhook is processed — refresh in a moment if it hasn&apos;t updated.
        </div>
      )}

      {/* Current plan summary */}
      <div className="bg-surface/60 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">
            Current plan
          </p>
          <p className="mt-1 text-2xl font-semibold text-accent">{user.plan}</p>
          <p className="mt-1 text-sm text-muted">
            {user.subscriptionStatus
              ? `Status: ${user.subscriptionStatus}`
              : "No active subscription"}
            {user.planRenewsAt
              ? ` · Renews ${formatDateTime(user.planRenewsAt)}`
              : ""}
          </p>
        </div>
        {user.dodoCustomerId && <ManageBillingButton />}
      </div>

      {/* Plan selector */}
      <div className="mt-8">
        <PlanSelector
          currentPlan={user.plan}
          billingConfigured={configured}
          initialInterval={interval}
        />
      </div>
    </div>
  );
}
