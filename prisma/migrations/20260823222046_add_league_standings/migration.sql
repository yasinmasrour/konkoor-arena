-- CreateTable
CREATE TABLE "ArenaLeagueStanding" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "finalRating" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaLeagueStanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaLeagueStanding_leagueId_rank_idx" ON "ArenaLeagueStanding"("leagueId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaLeagueStanding_leagueId_userId_key" ON "ArenaLeagueStanding"("leagueId", "userId");

-- AddForeignKey
ALTER TABLE "ArenaLeagueStanding" ADD CONSTRAINT "ArenaLeagueStanding_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaLeagueStanding" ADD CONSTRAINT "ArenaLeagueStanding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
