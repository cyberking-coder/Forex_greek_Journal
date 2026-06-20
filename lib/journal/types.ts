import type { JournalEntry } from "@prisma/client";

/** One checklist item's ticked state, snapshotted with its label. */
export type ChecklistState = {
  id: string;
  label: string;
  checked: boolean;
};

/** Client-serializable journal shape. */
export type SerializedJournal = {
  notes: string;
  strategyTag: string;
  mood: string | null;
  rating: number | null;
  screenshotUrls: string[];
  checklist: ChecklistState[];
};

/** Result returned by journal/settings server actions. */
export type JournalActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      code?: "UNAUTHENTICATED" | "VALIDATION" | "NOT_FOUND";
    };

export function serializeJournal(
  entry: JournalEntry | null,
): SerializedJournal {
  return {
    notes: entry?.notes ?? "",
    strategyTag: entry?.strategyTag ?? "",
    mood: entry?.mood ?? null,
    rating: entry?.rating ?? null,
    screenshotUrls: entry?.screenshotUrls ?? [],
    checklist: (entry?.checklist as ChecklistState[] | null) ?? [],
  };
}
