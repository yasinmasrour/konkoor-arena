-- CreateTable
CREATE TABLE "ArenaMatch" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "winnerId" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaMatchPlayer" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lives" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'playing',
    "isWinner" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaMatchPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaMatchQuestion" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaMatchQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaMatchPlayer_userId_idx" ON "ArenaMatchPlayer"("userId");

-- CreateIndex
CREATE INDEX "ArenaMatchPlayer_matchId_idx" ON "ArenaMatchPlayer"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMatchPlayer_matchId_userId_key" ON "ArenaMatchPlayer"("matchId", "userId");

-- CreateIndex
CREATE INDEX "ArenaMatchQuestion_questionId_idx" ON "ArenaMatchQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMatchQuestion_matchId_questionId_key" ON "ArenaMatchQuestion"("matchId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMatchQuestion_matchId_order_key" ON "ArenaMatchQuestion"("matchId", "order");

-- AddForeignKey
ALTER TABLE "ArenaMatchPlayer" ADD CONSTRAINT "ArenaMatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "ArenaMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaMatchPlayer" ADD CONSTRAINT "ArenaMatchPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaMatchQuestion" ADD CONSTRAINT "ArenaMatchQuestion_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "ArenaMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaMatchQuestion" ADD CONSTRAINT "ArenaMatchQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
