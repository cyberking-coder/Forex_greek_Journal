/** Result returned by billing server actions. */
export type BillingActionResult =
  | { ok: true; url: string }
  | { ok: false; error: string };
