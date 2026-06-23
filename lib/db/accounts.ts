import type { AccountPlatform, AccountSyncStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { MappedTrade } from "@/lib/metaapi/mapping";

export function listTradingAccounts(userId: string) {
  return prisma.tradingAccount.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { trades: true } } },
  });
}

export function getTradingAccount(userId: string, id: string) {
  return prisma.tradingAccount.findFirst({ where: { id, userId } });
}

/**
 * Every active, connected account across all users — for the background sync
 * worker / cron. Returns just the ids needed to drive syncTradingAccount.
 */
export function listAllActiveAccounts() {
  return prisma.tradingAccount.findMany({
    where: { isActive: true, metaApiAccountId: { not: null } },
    select: { id: true, userId: true },
  });
}

export function countTradingAccounts(userId: string): Promise<number> {
  return prisma.tradingAccount.count({ where: { userId } });
}

export type CreateTradingAccountData = {
  broker: string;
  login: string;
  server: string;
  type: AccountPlatform;
  metaApiAccountId: string;
  investorPassword: string; // already encrypted
  status: AccountSyncStatus;
};

export function createTradingAccount(
  userId: string,
  data: CreateTradingAccountData,
) {
  return prisma.tradingAccount.create({ data: { ...data, userId } });
}

export type AccountSyncUpdate = {
  status?: AccountSyncStatus;
  statusMessage?: string | null;
  lastSyncedAt?: Date;
};

export function updateAccountSync(id: string, data: AccountSyncUpdate) {
  return prisma.tradingAccount.update({ where: { id }, data });
}

export async function deleteTradingAccount(
  userId: string,
  id: string,
): Promise<boolean> {
  const result = await prisma.tradingAccount.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}

/**
 * Inserts or updates a synced trade, deduped on (tradingAccountId, externalId).
 * Returns whether the row was created or updated.
 */
export async function upsertSyncedTrade(
  userId: string,
  tradingAccountId: string,
  m: MappedTrade,
): Promise<"created" | "updated"> {
  const where = {
    tradingAccountId_externalId: { tradingAccountId, externalId: m.externalId },
  };
  const existing = await prisma.trade.findUnique({
    where,
    select: { id: true },
  });

  const common = {
    symbol: m.symbol,
    side: m.side,
    volume: m.volume,
    openPrice: m.openPrice,
    closePrice: m.closePrice,
    openTime: m.openTime,
    closeTime: m.closeTime,
    commission: m.commission,
    swap: m.swap,
    pnl: m.pnl,
  };

  await prisma.trade.upsert({
    where,
    create: {
      userId,
      tradingAccountId,
      externalId: m.externalId,
      source: "SYNC",
      ...common,
    },
    update: common,
  });

  return existing ? "updated" : "created";
}
