import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Fetch a user's trade with its journal entry (ownership-scoped). */
export function getTradeWithJournal(userId: string, tradeId: string) {
  return prisma.trade.findFirst({
    where: { id: tradeId, userId },
    include: { journalEntry: true },
  });
}

export type JournalWriteData = {
  notes: string | null;
  strategyTag: string | null;
  mood: string | null;
  rating: number | null;
  screenshotUrls: string[];
  checklist: Prisma.InputJsonValue;
};

/**
 * Create or update the journal entry for a trade the user owns.
 * Returns false if the trade doesn't belong to the user.
 */
export async function upsertJournalEntry(
  userId: string,
  tradeId: string,
  data: JournalWriteData,
): Promise<boolean> {
  const trade = await prisma.trade.findFirst({
    where: { id: tradeId, userId },
    select: { id: true },
  });
  if (!trade) return false;

  await prisma.journalEntry.upsert({
    where: { tradeId },
    create: { tradeId, ...data },
    update: data,
  });
  return true;
}

/** Distinct strategy tags the user has used — powers tag suggestions/filtering. */
export async function getUsedTags(userId: string): Promise<string[]> {
  const rows = await prisma.journalEntry.findMany({
    where: { trade: { userId }, strategyTag: { not: null } },
    select: { strategyTag: true },
    distinct: ["strategyTag"],
    take: 50,
  });
  return rows.map((r) => r.strategyTag).filter((t): t is string => Boolean(t));
}
