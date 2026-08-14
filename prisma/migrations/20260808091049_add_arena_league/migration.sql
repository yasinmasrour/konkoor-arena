/*
  Warnings:

  - Added the required column `leagueId` to the `ArenaMatch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArenaMatch" ADD COLUMN     "leagueId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ArenaLeague" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lesson" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaLeague_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ArenaMatch" ADD CONSTRAINT "ArenaMatch_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
