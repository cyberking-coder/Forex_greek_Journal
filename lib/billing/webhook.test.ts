import { describe, it, expect, beforeEach } from "vitest";
import { Webhook } from "standardwebhooks";
import { resolvePlanUpdate, verifyWebhook } from "./webhook";

describe("resolvePlanUpdate", () => {
  it("activates the plan from metadata", () => {
    const u = resolvePlanUpdate({
      type: "subscription.active",
      data: {
        subscription_id: "sub_1",
        status: "active",
        customer: { customer_id: "cus_1" },
        metadata: { userId: "user_1", plan: "PRO" },
        next_billing_date: "2026-07-20T00:00:00.000Z",
      },
    });
    expect(u).not.toBeNull();
    expect(u!.plan).toBe("PRO");
    expect(u!.userId).toBe("user_1");
    expect(u!.subscriptionId).toBe("sub_1");
    expect(u!.planRenewsAt?.toISOString()).toBe("2026-07-20T00:00:00.000Z");
  });

  it("resolves the plan from product_id when metadata is absent", () => {
    process.env.DODO_PRODUCT_ELITE_MONTHLY = "pdt_elite_m";
    const u = resolvePlanUpdate({
      type: "subscription.renewed",
      data: { product_id: "pdt_elite_m", status: "active" },
    });
    expect(u!.plan).toBe("ELITE");
  });

  it("downgrades to FREE on cancellation/expiry", () => {
    for (const type of ["subscription.cancelled", "subscription.expired"]) {
      const u = resolvePlanUpdate({ type, data: { subscription_id: "s" } });
      expect(u!.plan).toBe("FREE");
    }
  });

  it("ignores non-subscription events", () => {
    expect(resolvePlanUpdate({ type: "payment.succeeded" })).toBeNull();
  });

  it("ignores activation it cannot map to a plan", () => {
    delete process.env.DODO_PRODUCT_PRO_MONTHLY;
    delete process.env.DODO_PRODUCT_PRO_YEARLY;
    delete process.env.DODO_PRODUCT_ELITE_MONTHLY;
    delete process.env.DODO_PRODUCT_ELITE_YEARLY;
    expect(
      resolvePlanUpdate({ type: "subscription.active", data: {} }),
    ).toBeNull();
  });
});

describe("verifyWebhook (Standard Webhooks signature)", () => {
  const secret = "whsec_" + Buffer.from("super-secret-key").toString("base64");

  beforeEach(() => {
    process.env.DODO_PAYMENTS_WEBHOOK_KEY = secret;
  });

  function signed(payload: string) {
    const wh = new Webhook(secret.replace(/^whsec_/, ""));
    const id = "msg_test";
    const timestamp = new Date();
    const signature = wh.sign(id, timestamp, payload);
    return {
      "webhook-id": id,
      "webhook-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "webhook-signature": signature,
    };
  }

  it("verifies a correctly signed payload", () => {
    const payload = JSON.stringify({ type: "subscription.active", data: {} });
    const event = verifyWebhook(payload, signed(payload));
    expect(event.type).toBe("subscription.active");
  });

  it("rejects a tampered payload", () => {
    const payload = JSON.stringify({ type: "subscription.active", data: {} });
    const headers = signed(payload);
    expect(() =>
      verifyWebhook(JSON.stringify({ type: "tampered" }), headers),
    ).toThrow();
  });
});
