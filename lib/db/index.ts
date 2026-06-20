import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client. In development Next.js clears the module cache on
 * each request, which would otherwise spawn a new client (and connection pool)
 * every time, so we cache it on the global object.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
