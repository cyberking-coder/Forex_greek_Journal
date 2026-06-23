import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { canUseLounge } from "@/lib/plan";
import { getMessages } from "@/lib/db/chat";
import { CHANNELS, resolveChannel } from "@/lib/chat/channels";
import { isRealtimeConfigured } from "@/lib/chat/realtime";
import { LoungeClient } from "@/components/lounge/LoungeClient";

export const metadata = { title: "Traders Lounge" };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function LoungePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const channelParam =
    typeof searchParams.channel === "string" ? searchParams.channel : undefined;
  const channel = resolveChannel(channelParam);

  return (
    <div className="container-marketing py-10">
      <Link
        href="/dashboard"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <MessagesSquare className="h-6 w-6 text-accent" aria-hidden />
        Traders Lounge
      </h1>
      <p className="mt-1 text-sm text-muted">
        Real-time chat with fellow traders.
      </p>

      {!canUseLounge(user.plan) ? (
        <div className="bg-surface/60 mt-8 rounded-2xl border border-border p-12 text-center">
          <div className="bg-accent/15 mx-auto flex h-12 w-12 items-center justify-center rounded-full text-accent">
            <Lock className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="mt-4 text-lg font-semibold">An Elite perk</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            The Traders Lounge is available on the Elite plan. Upgrade to chat
            live with the community.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-5 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
          >
            Upgrade to Elite
          </Link>
        </div>
      ) : (
        <LoungeClient
          channels={CHANNELS}
          initialChannel={channel}
          initialMessages={await getMessages(channel, user.id)}
          currentUserId={user.id}
          realtimeEnabled={isRealtimeConfigured()}
        />
      )}
    </div>
  );
}

export const dynamic = "force-dynamic";
