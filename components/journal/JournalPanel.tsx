"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { ChecklistItem } from "@prisma/client";
import type { SerializedJournal, ChecklistState } from "@/lib/journal/types";
import { saveJournalAction } from "@/app/(app)/dashboard/trades/[id]/actions";
import { StarRating } from "./StarRating";
import { MoodSelector } from "./MoodSelector";
import { StrategyTagInput } from "./StrategyTagInput";
import { ChecklistField } from "./ChecklistField";
import { ScreenshotUploader } from "./ScreenshotUploader";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-foreground">{title}</h3>
      {children}
    </div>
  );
}

export function JournalPanel({
  tradeId,
  initial,
  checklistItems,
  usedTags,
}: {
  tradeId: string;
  initial: SerializedJournal;
  checklistItems: ChecklistItem[];
  usedTags: string[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initial.notes);
  const [strategyTag, setStrategyTag] = useState(initial.strategyTag);
  const [mood, setMood] = useState<string | null>(initial.mood);
  const [rating, setRating] = useState<number | null>(initial.rating);
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(
    initial.screenshotUrls,
  );
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initial.checklist.map((c) => [c.id, c.checked])),
  );

  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    setSaved(false);

    const checklist: ChecklistState[] = checklistItems.map((item) => ({
      id: item.id,
      label: item.label,
      checked: Boolean(checked[item.id]),
    }));

    startTransition(async () => {
      const result = await saveJournalAction(tradeId, {
        notes,
        strategyTag,
        mood,
        rating,
        screenshotUrls,
        checklist,
      });
      if (result.ok) {
        setSaved(true);
        router.refresh();
        return;
      }
      setError(result.error);
    });
  }

  return (
    <div className="space-y-6">
      <Section title="Notes">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="What was your thesis? How did you execute? Markdown is fine."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </Section>

      <Section title="Strategy tag">
        <StrategyTagInput
          value={strategyTag}
          onChange={setStrategyTag}
          usedTags={usedTags}
        />
      </Section>

      <div className="grid gap-6 sm:grid-cols-2">
        <Section title="Mood">
          <MoodSelector value={mood} onChange={setMood} />
        </Section>
        <Section title="Rating">
          <StarRating value={rating} onChange={setRating} />
        </Section>
      </div>

      <Section title="Pre-trade checklist">
        <ChecklistField
          items={checklistItems}
          checked={checked}
          onToggle={(id, value) =>
            setChecked((prev) => ({ ...prev, [id]: value }))
          }
        />
      </Section>

      <Section title="Screenshots">
        <ScreenshotUploader
          urls={screenshotUrls}
          onChange={setScreenshotUrls}
        />
      </Section>

      <div className="flex items-center gap-3 border-t border-border pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save journal"}
        </button>
        {saved && !pending && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
            <Check className="h-4 w-4" aria-hidden /> Saved
          </span>
        )}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </div>
  );
}
