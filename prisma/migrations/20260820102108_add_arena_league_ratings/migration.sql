-- CreateTable
CREATE TABLE "ArenaLeaguePlayer" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaLeaguePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaRating" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaLeaguePlayer_leagueId_rating_idx" ON "ArenaLeaguePlayer"("leagueId", "rating");

-- CreateIndex
CREATE INDEX "ArenaLeaguePlayer_userId_idx" ON "ArenaLeaguePlayer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaLeaguePlayer_leagueId_userId_key" ON "ArenaLeaguePlayer"("leagueId", "userId");

-- CreateIndex
CREATE INDEX "ArenaRating_leagueId_rating_idx" ON "ArenaRating"("leagueId", "rating");

-- CreateIndex
CREATE INDEX "ArenaRating_userId_idx" ON "ArenaRating"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaRating_leagueId_userId_key" ON "ArenaRating"("leagueId", "userId");

-- AddForeignKey
ALTER TABLE "ArenaLeaguePlayer" ADD CONSTRAINT "ArenaLeaguePlayer_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaLeaguePlayer" ADD CONSTRAINT "ArenaLeaguePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRating" ADD CONSTRAINT "ArenaRating_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRating" ADD CONSTRAINT "ArenaRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
