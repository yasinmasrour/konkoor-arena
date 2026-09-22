-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 3000000;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "examId" TEXT;

-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "features" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ExamPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentId" TEXT,
    "purchasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamPurchase_paymentId_key" ON "ExamPurchase"("paymentId");

-- CreateIndex
CREATE INDEX "ExamPurchase_userId_status_idx" ON "ExamPurchase"("userId", "status");

-- CreateIndex
CREATE INDEX "ExamPurchase_examId_status_idx" ON "ExamPurchase"("examId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExamPurchase_userId_examId_key" ON "ExamPurchase"("userId", "examId");

-- AddForeignKey
ALTER TABLE "ExamPurchase" ADD CONSTRAINT "ExamPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPurchase" ADD CONSTRAINT "ExamPurchase_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPurchase" ADD CONSTRAINT "ExamPurchase_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
