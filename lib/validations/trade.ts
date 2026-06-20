import { z } from "zod";

/** Treat empty form values as "not provided". */
const emptyToUndefined = (v: unknown) =>
  v === "" || v === null ? undefined : v;

const optionalPositive = z.preprocess(
  emptyToUndefined,
  z.coerce.number().positive().optional(),
);

const optionalDate = z.preprocess(emptyToUndefined, z.coerce.date().optional());

export const tradeInputSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(1, "Symbol is required")
      .max(20, "Symbol is too long")
      .transform((s) => s.toUpperCase()),
    side: z.enum(["BUY", "SELL"]),
    volume: z.coerce.number().positive("Volume must be greater than 0"),
    openPrice: z.coerce.number().positive("Open price must be greater than 0"),
    openTime: z.coerce.date(),
    closePrice: optionalPositive,
    closeTime: optionalDate,
    stopLoss: optionalPositive,
    takeProfit: optionalPositive,
    commission: z.preprocess(emptyToUndefined, z.coerce.number().default(0)),
    swap: z.preprocess(emptyToUndefined, z.coerce.number().default(0)),
  })
  .refine((d) => !d.closeTime || d.closeTime >= d.openTime, {
    message: "Close time must be after open time",
    path: ["closeTime"],
  });

export type TradeInput = z.infer<typeof tradeInputSchema>;
