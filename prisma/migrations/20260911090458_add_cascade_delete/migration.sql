/*
  Warnings:

  - Made the column `username` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ExamBooklet" DROP CONSTRAINT "ExamBooklet_bookletId_fkey";

-- DropForeignKey
ALTER TABLE "ExamBooklet" DROP CONSTRAINT "ExamBooklet_examId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ExamBooklet" ADD CONSTRAINT "ExamBooklet_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamBooklet" ADD CONSTRAINT "ExamBooklet_bookletId_fkey" FOREIGN KEY ("bookletId") REFERENCES "Booklet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
