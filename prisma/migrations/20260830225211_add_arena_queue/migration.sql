-- CreateTable
CREATE TABLE "ArenaQueue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaQueue_leagueId_status_rating_idx" ON "ArenaQueue"("leagueId", "status", "rating");

-- CreateIndex
CREATE INDEX "ArenaQueue_userId_status_idx" ON "ArenaQueue"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaQueue_userId_leagueId_key" ON "ArenaQueue"("userId", "leagueId");

-- AddForeignKey
ALTER TABLE "ArenaQueue" ADD CONSTRAINT "ArenaQueue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaQueue" ADD CONSTRAINT "ArenaQueue_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;
