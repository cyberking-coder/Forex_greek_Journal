import { prisma } from "@/lib/db";

export function listChecklistItems(userId: string) {
  return prisma.checklistItem.findMany({
    where: { userId },
    orderBy: { position: "asc" },
  });
}

export async function createChecklistItem(userId: string, label: string) {
  const count = await prisma.checklistItem.count({ where: { userId } });
  return prisma.checklistItem.create({
    data: { userId, label, position: count },
  });
}

/** Deletes a checklist item the user owns. Returns false if not found. */
export async function deleteChecklistItem(
  userId: string,
  id: string,
): Promise<boolean> {
  const result = await prisma.checklistItem.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}
