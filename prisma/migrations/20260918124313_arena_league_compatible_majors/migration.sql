/*
  Warnings:

  - You are about to drop the column `major` on the `ArenaQueue` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ArenaQueue_leagueId_status_grade_major_idx";

-- AlterTable
ALTER TABLE "ArenaLeague" ADD COLUMN     "compatibleMajors" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ArenaQueue" DROP COLUMN "major";

-- CreateIndex
CREATE INDEX "ArenaLeague_status_grade_idx" ON "ArenaLeague"("status", "grade");

-- CreateIndex
CREATE INDEX "ArenaQueue_leagueId_status_grade_idx" ON "ArenaQueue"("leagueId", "status", "grade");
