-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "percentile" DOUBLE PRECISION,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "tarazScore" DOUBLE PRECISION,
ADD COLUMN     "totalParticipants" INTEGER;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "averageScore" DOUBLE PRECISION,
ADD COLUMN     "lastStatsUpdate" TIMESTAMP(3),
ADD COLUMN     "participantCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stdDeviation" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Attempt_examId_status_score_idx" ON "Attempt"("examId", "status", "score");
