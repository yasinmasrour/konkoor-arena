-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_planId_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'subscription',
ALTER COLUMN "planId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending',
ALTER COLUMN "gateway" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "Payment_type_status_idx" ON "Payment"("type", "status");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
