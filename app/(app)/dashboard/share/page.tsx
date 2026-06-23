import Link from "next/link";
import { redirect } from "next/navigation";
import { Share2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSocialSettings } from "@/lib/db/social";
import { ShareControls } from "@/components/share/ShareControls";

export const metadata = { title: "Share — Greek Journal" };

export default async function SharePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const settings = await getSocialSettings(user.id);

  return (
    <div className="container-marketing py-10">
      <Link
        href="/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <Share2 className="h-6 w-6 text-accent" aria-hidden />
        Share
      </h1>
      <p className="mt-1 text-sm text-muted">
        Share a read-only view of your dashboard or post a stats card.
      </p>

      <div className="mt-6">
        <ShareControls
          initialEnabled={settings?.publicShareEnabled ?? false}
          initialToken={settings?.publicShareToken ?? null}
        />
      </div>
    </div>
  );
}
