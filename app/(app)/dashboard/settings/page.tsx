import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listChecklistItems } from "@/lib/db/checklist";
import { ChecklistSettings } from "@/components/settings/ChecklistSettings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const items = await listChecklistItems(user.id);

  return (
    <div className="container-marketing max-w-2xl py-10">
      <Link
        href="/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="bg-surface/60 mt-8 rounded-2xl border border-border p-6">
        <h2 className="text-lg font-semibold">Pre-trade checklist</h2>
        <p className="mt-1 text-sm text-muted">
          Define the rules you want to confirm before taking a trade. You can
          tick them off on each trade&apos;s journal.
        </p>
        <div className="mt-5">
          <ChecklistSettings items={items} />
        </div>
      </section>
    </div>
  );
}
