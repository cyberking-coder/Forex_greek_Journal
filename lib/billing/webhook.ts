import { Webhook } from "standardwebhooks";
import type { Plan } from "@prisma/client";
import { planForProductId, type PaidPlan } from "./config";

/** Minimal shape of a Dodo subscription/payment webhook payload. */
export type DodoWebhookEvent = {
  type: string;
  data?: {
    payload_type?: string;
    subscription_id?: string;
    status?: string;
    product_id?: string;
    customer?: { customer_id?: string };
    metadata?: Record<string, string>;
    next_billing_date?: string;
  };
};

/** Verifies the Standard-Webhooks signature and returns the parsed event. Throws on failure. */
export function verifyWebhook(
  rawBody: string,
  headers: {
    "webhook-id"?: string | null;
    "webhook-signature"?: string | null;
    "webhook-timestamp"?: string | null;
  },
): DodoWebhookEvent {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) throw new Error("DODO_PAYMENTS_WEBHOOK_KEY is not set.");

  const wh = new Webhook(secret);
  return wh.verify(rawBody, {
    "webhook-id": headers["webhook-id"] ?? "",
    "webhook-signature": headers["webhook-signature"] ?? "",
    "webhook-timestamp": headers["webhook-timestamp"] ?? "",
  }) as DodoWebhookEvent;
}

export type PlanUpdate = {
  plan: Plan;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  planRenewsAt: Date | null;
  customerId: string | null;
  userId: string | null;
};

const ACTIVATING = new Set([
  "subscription.active",
  "subscription.renewed",
  "subscription.plan_changed",
]);
const DEACTIVATING = new Set([
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
  "subscription.on_hold",
]);

function resolvePaidPlan(
  data: NonNullable<DodoWebhookEvent["data"]>,
): PaidPlan | null {
  const metaPlan = data.metadata?.plan;
  if (metaPlan === "PRO" || metaPlan === "ELITE") return metaPlan;
  if (data.product_id) return planForProductId(data.product_id);
  return null;
}

/**
 * Maps a webhook event to the user's plan change. Returns null for events that
 * don't affect the subscription state.
 */
export function resolvePlanUpdate(event: DodoWebhookEvent): PlanUpdate | null {
  if (!event.type?.startsWith("subscription.")) return null;
  const data = event.data ?? {};
  const base = {
    subscriptionId: data.subscription_id ?? null,
    customerId: data.customer?.customer_id ?? null,
    userId: data.metadata?.userId ?? null,
  };

  if (ACTIVATING.has(event.type)) {
    const plan = resolvePaidPlan(data);
    if (!plan) return null;
    return {
      ...base,
      plan,
      subscriptionStatus: data.status ?? "active",
      planRenewsAt: data.next_billing_date
        ? new Date(data.next_billing_date)
        : null,
    };
  }

  if (DEACTIVATING.has(event.type)) {
    return {
      ...base,
      plan: "FREE",
      subscriptionStatus: data.status ?? event.type.split(".")[1] ?? "inactive",
      planRenewsAt: null,
    };
  }

  return null;
}
