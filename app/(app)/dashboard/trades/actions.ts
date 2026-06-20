"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { tradeInputSchema, type TradeInput } from "@/lib/validations/trade";
import { calculatePnl } from "@/lib/trades/pnl";
import { tradeLimitFor } from "@/lib/plans";
import type { ActionResult } from "@/lib/trades/types";
import {
  createTrade,
  updateTrade,
  deleteTrade,
  countTradesInCurrentMonth,
  type TradeWriteData,
} from "@/lib/db/trades";

function toWriteData(input: TradeInput): TradeWriteData {
  const closePrice = input.closePrice ?? null;
  const pnl =
    closePrice !== null
      ? calculatePnl({
          side: input.side,
          volume: input.volume,
          openPrice: input.openPrice,
          closePrice,
          commission: input.commission,
          swap: input.swap,
        })
      : null;

  return {
    symbol: input.symbol,
    side: input.side,
    volume: input.volume,
    openPrice: input.openPrice,
    closePrice,
    openTime: input.openTime,
    closeTime: input.closeTime ?? null,
    stopLoss: input.stopLoss ?? null,
    takeProfit: input.takeProfit ?? null,
    commission: input.commission,
    swap: input.swap,
    pnl,
  };
}

export async function createTradeAction(raw: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
      code: "UNAUTHENTICATED",
    };
  }

  const parsed = tradeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "VALIDATION",
    };
  }

  // Enforce the plan's monthly trade limit (counts trades created this month).
  const limit = tradeLimitFor(user.plan);
  if (limit !== null) {
    const used = await countTradesInCurrentMonth(user.id);
    if (used >= limit) {
      return {
        ok: false,
        error: `You've reached the Free plan limit of ${limit} trades this month. Upgrade to Pro for unlimited trades.`,
        code: "LIMIT_REACHED",
      };
    }
  }

  await createTrade(user.id, toWriteData(parsed.data));
  revalidatePath("/dashboard/trades");
  return { ok: true };
}

export async function updateTradeAction(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
      code: "UNAUTHENTICATED",
    };
  }

  const parsed = tradeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      code: "VALIDATION",
    };
  }

  const updated = await updateTrade(user.id, id, toWriteData(parsed.data));
  if (!updated) {
    return { ok: false, error: "Trade not found.", code: "NOT_FOUND" };
  }

  revalidatePath("/dashboard/trades");
  return { ok: true };
}

export async function deleteTradeAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      error: "You must be signed in.",
      code: "UNAUTHENTICATED",
    };
  }

  const deleted = await deleteTrade(user.id, id);
  if (!deleted) {
    return { ok: false, error: "Trade not found.", code: "NOT_FOUND" };
  }

  revalidatePath("/dashboard/trades");
  return { ok: true };
}
