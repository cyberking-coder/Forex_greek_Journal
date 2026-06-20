import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export function listAiReports(userId: string) {
  return prisma.aiReport.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function getAiReport(userId: string, id: string) {
  return prisma.aiReport.findFirst({ where: { id, userId } });
}

export type CreateAiReportData = {
  periodStart: Date;
  periodEnd: Date;
  grade: string;
  summary: string;
  contentJson: Prisma.InputJsonValue;
};

export function createAiReport(userId: string, data: CreateAiReportData) {
  return prisma.aiReport.create({ data: { ...data, userId } });
}

/** Timestamp of the user's most recent report, or null. */
export async function lastReportAt(userId: string): Promise<Date | null> {
  const latest = await prisma.aiReport.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  return latest?.createdAt ?? null;
}

/** Number of reports the user created since `since`. */
export function reportCountSince(userId: string, since: Date): Promise<number> {
  return prisma.aiReport.count({
    where: { userId, createdAt: { gte: since } },
  });
}
