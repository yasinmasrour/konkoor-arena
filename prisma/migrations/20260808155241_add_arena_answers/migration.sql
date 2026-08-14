-- CreateTable
CREATE TABLE "ArenaAnswer" (
    "id" TEXT NOT NULL,
    "matchQuestionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "selectedAnswer" INTEGER,
    "isCorrect" BOOLEAN NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responseTimeMs" INTEGER,

    CONSTRAINT "ArenaAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaAnswer_playerId_idx" ON "ArenaAnswer"("playerId");

-- CreateIndex
CREATE INDEX "ArenaAnswer_matchQuestionId_idx" ON "ArenaAnswer"("matchQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaAnswer_matchQuestionId_playerId_key" ON "ArenaAnswer"("matchQuestionId", "playerId");

-- AddForeignKey
ALTER TABLE "ArenaAnswer" ADD CONSTRAINT "ArenaAnswer_matchQuestionId_fkey" FOREIGN KEY ("matchQuestionId") REFERENCES "ArenaMatchQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
