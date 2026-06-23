import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canUseLounge } from "@/lib/plan";
import { getMessages } from "@/lib/db/chat";
import { resolveChannel } from "@/lib/chat/channels";

export const dynamic = "force-dynamic";

/** Polling endpoint: returns the recent message window for a channel. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canUseLounge(user.plan)) {
    return NextResponse.json({ error: "Elite required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const channel = resolveChannel(url.searchParams.get("channel"));
  const messages = await getMessages(channel, user.id);
  return NextResponse.json({ channel, messages });
}
