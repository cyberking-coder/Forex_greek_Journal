import type { Prisma, TradeSide } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SortOrder = "asc" | "desc";

export type ListTradesParams = {
  page?: number;
  pageSize?: number;
  symbol?: string;
  side?: TradeSide;
  /** Sort by openTime. */
  order?: SortOrder;
};

export type ListTradesResult = {
  trades: Awaited<ReturnType<typeof prisma.trade.findMany>>;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/** Fields written on create/update (PnL is computed by the caller). */
export type TradeWriteData = {
  symbol: string;
  side: TradeSide;
  volume: number;
  openPrice: number;
  closePrice: number | null;
  openTime: Date;
  closeTime: Date | null;
  stopLoss: number | null;
  takeProfit: number | null;
  commission: number;
  swap: number;
  pnl: number | null;
};

export async function listTrades(
  userId: string,
  params: ListTradesParams = {},
): Promise<ListTradesResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));

  const where: Prisma.TradeWhereInput = {
    userId,
    ...(params.symbol
      ? { symbol: { contains: params.symbol, mode: "insensitive" } }
      : {}),
    ...(params.side ? { side: params.side } : {}),
  };

  const [trades, total] = await prisma.$transaction([
    prisma.trade.findMany({
      where,
      orderBy: { openTime: params.order ?? "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trade.count({ where }),
  ]);

  return {
    trades,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function getTradeById(userId: string, id: string) {
  return prisma.trade.findFirst({ where: { id, userId } });
}

/** Count trades the user created in the current calendar month (usage cap). */
export function countTradesInCurrentMonth(userId: string): Promise<number> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return prisma.trade.count({
    where: { userId, createdAt: { gte: monthStart } },
  });
}

export function createTrade(userId: string, data: TradeWriteData) {
  return prisma.trade.create({
    data: { ...data, userId, source: "MANUAL" },
  });
}

/** Updates a trade the user owns. Returns false if it doesn't exist. */
export async function updateTrade(
  userId: string,
  id: string,
  data: TradeWriteData,
): Promise<boolean> {
  const result = await prisma.trade.updateMany({
    where: { id, userId },
    data,
  });
  return result.count > 0;
}

/** Deletes a trade the user owns. Returns false if it doesn't exist. */
export async function deleteTrade(
  userId: string,
  id: string,
): Promise<boolean> {
  const result = await prisma.trade.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
