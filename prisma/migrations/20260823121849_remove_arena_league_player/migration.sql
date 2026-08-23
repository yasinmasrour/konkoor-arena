/*
  Warnings:

  - You are about to drop the `ArenaLeaguePlayer` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ArenaLeaguePlayer" DROP CONSTRAINT "ArenaLeaguePlayer_leagueId_fkey";

-- DropForeignKey
ALTER TABLE "ArenaLeaguePlayer" DROP CONSTRAINT "ArenaLeaguePlayer_userId_fkey";

-- AlterTable
ALTER TABLE "ArenaMatch" ADD COLUMN     "ratingUpdated" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ArenaLeaguePlayer";
