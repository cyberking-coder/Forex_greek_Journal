import { z } from "zod";

export const connectAccountSchema = z.object({
  broker: z.string().trim().min(1, "Broker name is required").max(80),
  server: z.string().trim().min(1, "Server name is required").max(120),
  login: z.string().trim().min(1, "Login is required").max(60),
  password: z.string().min(1, "Investor password is required").max(200),
  platform: z.enum(["MT4", "MT5"]),
});

export type ConnectAccountInput = z.infer<typeof connectAccountSchema>;
