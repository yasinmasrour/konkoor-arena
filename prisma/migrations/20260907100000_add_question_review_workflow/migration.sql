-- CreateTable
CREATE TABLE "QuestionReview" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionReview_questionId_createdAt_idx" ON "QuestionReview"("questionId", "createdAt");
CREATE INDEX "QuestionReview_reviewerId_createdAt_idx" ON "QuestionReview"("reviewerId", "createdAt");
CREATE INDEX "QuestionReview_decision_createdAt_idx" ON "QuestionReview"("decision", "createdAt");

-- AddForeignKey
ALTER TABLE "QuestionReview" ADD CONSTRAINT "QuestionReview_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionReview" ADD CONSTRAINT "QuestionReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON UPDATE CASCADE;
