-- AlterTable
ALTER TABLE "AttemptAnswer" ADD COLUMN     "isFlagged" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AttemptBooklet" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "bookletId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "restUntil" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "finishedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttemptBooklet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttemptBooklet_attemptId_order_idx" ON "AttemptBooklet"("attemptId", "order");

-- CreateIndex
CREATE INDEX "AttemptBooklet_attemptId_status_idx" ON "AttemptBooklet"("attemptId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptBooklet_attemptId_bookletId_key" ON "AttemptBooklet"("attemptId", "bookletId");

-- AddForeignKey
ALTER TABLE "AttemptBooklet" ADD CONSTRAINT "AttemptBooklet_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptBooklet" ADD CONSTRAINT "AttemptBooklet_bookletId_fkey" FOREIGN KEY ("bookletId") REFERENCES "Booklet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
