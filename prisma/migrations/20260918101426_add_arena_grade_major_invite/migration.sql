/*
  Warnings:

  - Added the required column `grade` to the `ArenaLeague` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `ArenaQueue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ArenaLeague" ADD COLUMN     "grade" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ArenaMatch" ADD COLUMN     "isFriendly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ArenaQueue" ADD COLUMN     "grade" TEXT NOT NULL,
ADD COLUMN     "major" TEXT;

-- CreateTable
CREATE TABLE "ArenaInvite" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "usedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArenaInvite_code_key" ON "ArenaInvite"("code");

-- CreateIndex
CREATE INDEX "ArenaInvite_code_status_idx" ON "ArenaInvite"("code", "status");

-- CreateIndex
CREATE INDEX "ArenaInvite_inviterId_status_idx" ON "ArenaInvite"("inviterId", "status");

-- CreateIndex
CREATE INDEX "ArenaInvite_expiresAt_status_idx" ON "ArenaInvite"("expiresAt", "status");

-- CreateIndex
CREATE INDEX "ArenaLeague_status_grade_lesson_idx" ON "ArenaLeague"("status", "grade", "lesson");

-- CreateIndex
CREATE INDEX "ArenaQueue_leagueId_status_grade_major_idx" ON "ArenaQueue"("leagueId", "status", "grade", "major");

-- AddForeignKey
ALTER TABLE "ArenaInvite" ADD CONSTRAINT "ArenaInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaInvite" ADD CONSTRAINT "ArenaInvite_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "ArenaLeague"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaInvite" ADD CONSTRAINT "ArenaInvite_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
