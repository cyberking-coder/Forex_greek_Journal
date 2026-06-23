import { NextResponse } from "next/server";
import { verifyWebhook, resolvePlanUpdate } from "@/lib/billing/webhook";
import {
  getUserById,
  getUserByDodoCustomer,
  updateUserBilling,
} from "@/lib/db/billing";

// Dodo Payments subscription webhook. Verifies the Standard-Webhooks signature,
// then updates User.plan on activation / cancellation / downgrade.
export async function POST(request: Request) {
  const rawBody = await request.text();

  let event;
  try {
    event = verifyWebhook(rawBody, {
      "webhook-id": request.headers.get("webhook-id"),
      "webhook-signature": request.headers.get("webhook-signature"),
      "webhook-timestamp": request.headers.get("webhook-timestamp"),
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const update = resolvePlanUpdate(event);
  if (!update) {
    // Not a subscription-affecting event — acknowledge and ignore.
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Resolve the user from metadata first, then by Dodo customer id.
  const user =
    (update.userId ? await getUserById(update.userId) : null) ??
    (update.customerId ? await getUserByDodoCustomer(update.customerId) : null);

  if (!user) {
    // Can't map to a user; acknowledge so Dodo doesn't retry forever.
    return NextResponse.json({ ok: true, unmatched: true });
  }

  await updateUserBilling(user.id, {
    plan: update.plan,
    subscriptionId: update.subscriptionId,
    subscriptionStatus: update.subscriptionStatus,
    planRenewsAt: update.planRenewsAt,
    dodoCustomerId: update.customerId,
  });

  return NextResponse.json({ ok: true, plan: update.plan });
}
