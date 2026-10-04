-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "discountEndsAt" TIMESTAMP(3),
ADD COLUMN     "discountPercent" INTEGER;
