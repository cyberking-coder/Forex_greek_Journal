"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { checklistItemSchema } from "@/lib/validations/journal";
import { createChecklistItem, deleteChecklistItem } from "@/lib/db/checklist";
import type { JournalActionResult } from "@/lib/journal/types";

export async function addChecklistItemAction(
  raw: unknown,
): Promise<JournalActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
      code: "UNAUTHENTICATED",
    };
  }

  const parsed = checklistItemSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "VALIDATION",
    };
  }

  await createChecklistItem(user.id, parsed.data.label);
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function deleteChecklistItemAction(
  id: string,
): Promise<JournalActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
      code: "UNAUTHENTICATED",
    };
  }

  const deleted = await deleteChecklistItem(user.id, id);
  if (!deleted) {
    return { ok: false, error: "Item not found.", code: "NOT_FOUND" };
  }

  revalidatePath("/dashboard/settings");
  return { ok: true };
}
