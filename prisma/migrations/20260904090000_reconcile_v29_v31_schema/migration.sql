-- Reconcile schema changes that are already present in existing development databases
-- but were not recorded in the migration history.

-- Attempt hardening
CREATE INDEX "Attempt_studentId_status_idx" ON "Attempt"("studentId", "status");

-- AttemptAnswer snapshot fields
ALTER TABLE "AttemptAnswer" ADD COLUMN "questionTextSnapshot" TEXT;
ALTER TABLE "AttemptAnswer" ADD COLUMN "questionImageSnapshot" TEXT;
ALTER TABLE "AttemptAnswer" ADD COLUMN "optionsSnapshot" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "AttemptAnswer" ADD COLUMN "correctAnswerSnapshot" INTEGER;
ALTER TABLE "AttemptAnswer" ADD COLUMN "explanationSnapshot" TEXT;
ALTER TABLE "AttemptAnswer" ADD COLUMN "difficultySnapshot" TEXT;
ALTER TABLE "AttemptAnswer" ADD COLUMN "lessonSnapshot" TEXT;
ALTER TABLE "AttemptAnswer" ADD COLUMN "chapterSnapshot" TEXT;
ALTER TABLE "AttemptAnswer" ADD COLUMN "scoreSnapshot" DOUBLE PRECISION NOT NULL DEFAULT 1;
CREATE INDEX "AttemptAnswer_attemptId_selectedAnswer_idx" ON "AttemptAnswer"("attemptId", "selectedAnswer");

-- Arena rating history idempotency hardening
CREATE UNIQUE INDEX "ArenaRatingHistory_matchId_userId_key" ON "ArenaRatingHistory"("matchId", "userId");
