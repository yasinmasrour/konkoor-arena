-- CreateTable
CREATE TABLE "SoloMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'playing',
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "wrongAnswers" INTEGER NOT NULL DEFAULT 0,
    "timeouts" INTEGER NOT NULL DEFAULT 0,
    "livesRemaining" INTEGER NOT NULL DEFAULT 3,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "totalTimeMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoloMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoloMatchQuestion" (
    "id" TEXT NOT NULL,
    "soloMatchId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "selectedAnswer" INTEGER,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "isTimeout" BOOLEAN NOT NULL DEFAULT false,
    "timeLimit" INTEGER NOT NULL,
    "timeSpentMs" INTEGER,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoloMatchQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SoloMatch_userId_createdAt_idx" ON "SoloMatch"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SoloMatch_status_createdAt_idx" ON "SoloMatch"("status", "createdAt");

-- CreateIndex
CREATE INDEX "SoloMatch_level_status_idx" ON "SoloMatch"("level", "status");

-- CreateIndex
CREATE INDEX "SoloMatch_leagueId_idx" ON "SoloMatch"("leagueId");

-- CreateIndex
CREATE INDEX "SoloMatchQuestion_soloMatchId_idx" ON "SoloMatchQuestion"("soloMatchId");

-- CreateIndex
CREATE INDEX "SoloMatchQuestion_questionId_idx" ON "SoloMatchQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SoloMatchQuestion_soloMatchId_order_key" ON "SoloMatchQuestion"("soloMatchId", "order");

-- AddForeignKey
ALTER TABLE "SoloMatch" ADD CONSTRAINT "SoloMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloMatch" ADD CONSTRAINT "SoloMatch_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloMatchQuestion" ADD CONSTRAINT "SoloMatchQuestion_soloMatchId_fkey" FOREIGN KEY ("soloMatchId") REFERENCES "SoloMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoloMatchQuestion" ADD CONSTRAINT "SoloMatchQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
