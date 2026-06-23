-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dodoCustomerId" TEXT,
ADD COLUMN     "planRenewsAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;
