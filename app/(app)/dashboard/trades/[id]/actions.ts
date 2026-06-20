"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { journalSchema } from "@/lib/validations/journal";
import { upsertJournalEntry } from "@/lib/db/journal";
import type { JournalActionResult } from "@/lib/journal/types";

export async function saveJournalAction(
  tradeId: string,
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

  const parsed = journalSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "VALIDATION",
    };
  }

  const { notes, strategyTag, mood, rating, screenshotUrls, checklist } =
    parsed.data;

  const saved = await upsertJournalEntry(user.id, tradeId, {
    notes,
    strategyTag,
    mood,
    rating,
    screenshotUrls,
    checklist,
  });
  if (!saved) {
    return { ok: false, error: "Trade not found.", code: "NOT_FOUND" };
  }

  revalidatePath(`/dashboard/trades/${tradeId}`);
  revalidatePath("/dashboard/trades");
  return { ok: true };
}
