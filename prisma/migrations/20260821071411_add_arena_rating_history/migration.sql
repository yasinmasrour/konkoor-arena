-- CreateTable
CREATE TABLE "ArenaRatingHistory" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "oldRating" INTEGER NOT NULL,
    "newRating" INTEGER NOT NULL,
    "change" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaRatingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaRatingHistory_leagueId_userId_idx" ON "ArenaRatingHistory"("leagueId", "userId");

-- CreateIndex
CREATE INDEX "ArenaRatingHistory_matchId_idx" ON "ArenaRatingHistory"("matchId");

-- AddForeignKey
ALTER TABLE "ArenaRatingHistory" ADD CONSTRAINT "ArenaRatingHistory_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRatingHistory" ADD CONSTRAINT "ArenaRatingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRatingHistory" ADD CONSTRAINT "ArenaRatingHistory_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "ArenaMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
