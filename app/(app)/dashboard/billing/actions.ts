"use server";

import { getCurrentUser } from "@/lib/auth";
import { getUserById, setDodoCustomerId } from "@/lib/db/billing";
import {
  appBaseUrl,
  isBillingConfigured,
  productIdFor,
  type Interval,
  type PaidPlan,
} from "@/lib/billing/config";
import {
  ensureCustomer,
  createCheckoutSession,
  createPortalSession,
  BillingError,
} from "@/lib/billing/dodo";
import type { BillingActionResult } from "@/lib/billing/types";

export async function createCheckoutAction(
  plan: PaidPlan,
  interval: Interval,
): Promise<BillingActionResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { ok: false, error: "You must be signed in." };

  if (!isBillingConfigured()) {
    return { ok: false, error: "Billing is not configured on the server." };
  }
  const productId = productIdFor(plan, interval);
  if (!productId) {
    return {
      ok: false,
      error: `The ${plan} ${interval} plan is not configured. Set DODO_PRODUCT_${plan}_${interval.toUpperCase()}.`,
    };
  }

  const user = await getUserById(sessionUser.id);
  if (!user) return { ok: false, error: "Account not found." };

  try {
    const customerId = await ensureCustomer({
      customerId: user.dodoCustomerId,
      email: user.email,
      name: user.name,
    });
    if (customerId !== user.dodoCustomerId) {
      await setDodoCustomerId(user.id, customerId);
    }

    const url = await createCheckoutSession({
      productId,
      customerId,
      userId: user.id,
      plan,
      interval,
      returnUrl: `${appBaseUrl()}/dashboard/billing?status=success`,
    });
    return { ok: true, url };
  } catch (err) {
    const error =
      err instanceof BillingError
        ? err.message
        : "Could not start checkout. Please try again.";
    return { ok: false, error };
  }
}

export async function createPortalAction(): Promise<BillingActionResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) return { ok: false, error: "You must be signed in." };

  if (!isBillingConfigured()) {
    return { ok: false, error: "Billing is not configured on the server." };
  }

  const user = await getUserById(sessionUser.id);
  if (!user?.dodoCustomerId) {
    return { ok: false, error: "No subscription to manage yet." };
  }

  try {
    const url = await createPortalSession(
      user.dodoCustomerId,
      `${appBaseUrl()}/dashboard/billing`,
    );
    return { ok: true, url };
  } catch (err) {
    const error =
      err instanceof BillingError
        ? err.message
        : "Could not open the billing portal. Please try again.";
    return { ok: false, error };
  }
}
