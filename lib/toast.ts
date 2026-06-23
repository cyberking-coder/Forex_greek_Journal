"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Single import surface for toasts so call sites don't depend on sonner
 * directly. Use `toast.success(...)`, `toast.error(...)`, etc.
 */
export const toast = sonnerToast;

/**
 * Surface a server-action result as a toast. Returns whether it succeeded so
 * callers can branch (e.g. close a modal) without re-checking `ok`.
 */
export function toastResult(
  result: { ok: true } | { ok: false; error: string },
  successMessage?: string,
): boolean {
  if (result.ok) {
    if (successMessage) toast.success(successMessage);
    return true;
  }
  toast.error(result.error);
  return false;
}
