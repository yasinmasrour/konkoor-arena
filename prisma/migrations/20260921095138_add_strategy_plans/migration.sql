-- CreateTable
CREATE TABLE "StrategyPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "grade" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StrategyPlan_grade_major_isPublished_idx" ON "StrategyPlan"("grade", "major", "isPublished");

-- AddForeignKey
ALTER TABLE "StrategyPlan" ADD CONSTRAINT "StrategyPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
