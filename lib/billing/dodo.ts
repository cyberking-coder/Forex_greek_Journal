import DodoPayments from "dodopayments";
import type { Interval, PaidPlan } from "./config";

export class BillingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BillingError";
  }
}

function client(): DodoPayments {
  const bearerToken = process.env.DODO_PAYMENTS_API_KEY;
  if (!bearerToken) throw new BillingError("DODO_PAYMENTS_API_KEY is not set.");
  return new DodoPayments({
    bearerToken,
    environment:
      process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
        ? "live_mode"
        : "test_mode",
  });
}

/** Creates the Dodo customer if needed, returning the customer id. */
export async function ensureCustomer(input: {
  customerId: string | null;
  email: string;
  name: string | null;
}): Promise<string> {
  if (input.customerId) return input.customerId;
  const customer = await client().customers.create({
    email: input.email,
    name: input.name || input.email,
  });
  return customer.customer_id;
}

/** Starts a hosted Dodo Checkout session for a subscription. Returns the URL. */
export async function createCheckoutSession(input: {
  productId: string;
  customerId: string;
  userId: string;
  plan: PaidPlan;
  interval: Interval;
  returnUrl: string;
}): Promise<string> {
  const session = await client().checkoutSessions.create({
    product_cart: [{ product_id: input.productId, quantity: 1 }],
    customer: { customer_id: input.customerId },
    metadata: {
      userId: input.userId,
      plan: input.plan,
      interval: input.interval,
    },
    return_url: input.returnUrl,
  });
  if (!session.checkout_url) {
    throw new BillingError("Dodo did not return a checkout URL.");
  }
  return session.checkout_url;
}

/** Creates a Dodo customer-portal session (manage/cancel). Returns the URL. */
export async function createPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  const session = await client().customers.customerPortal.create(customerId, {
    return_url: returnUrl,
  });
  return session.link;
}
