-- CreateEnum
CREATE TYPE "AccountSyncStatus" AS ENUM ('PENDING', 'DEPLOYING', 'CONNECTED', 'SYNCING', 'ERROR', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "TradingAccount" ADD COLUMN     "investorPassword" TEXT,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "status" "AccountSyncStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusMessage" TEXT;
