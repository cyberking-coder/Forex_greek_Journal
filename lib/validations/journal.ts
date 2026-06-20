import { z } from "zod";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

/** Accept absolute URLs (cloud storage) or app-relative paths (local fallback). */
const screenshotUrl = z
  .string()
  .refine((s) => s.startsWith("/") || /^https?:\/\//.test(s), {
    message: "Invalid screenshot URL",
  });

const checklistStateSchema = z.object({
  id: z.string(),
  label: z.string().max(200),
  checked: z.boolean(),
});

export const journalSchema = z.object({
  notes: z.preprocess(emptyToNull, z.string().max(20000).nullable()),
  strategyTag: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .max(60)
      .transform((s) => s || null)
      .nullable(),
  ),
  mood: z.preprocess(emptyToNull, z.string().max(40).nullable()),
  rating: z.preprocess(
    emptyToNull,
    z.coerce.number().int().min(1).max(5).nullable(),
  ),
  screenshotUrls: z.array(screenshotUrl).max(20).default([]),
  checklist: z.array(checklistStateSchema).max(100).default([]),
});

export type JournalInput = z.infer<typeof journalSchema>;

/** Settings: a single checklist item label. */
export const checklistItemSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(120),
});
