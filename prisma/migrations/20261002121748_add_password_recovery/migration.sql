-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "passwordResetLockedUntil" TIMESTAMP(3),
ADD COLUMN     "recoveryCodeHash" TEXT,
ADD COLUMN     "recoverySetupAt" TIMESTAMP(3),
ADD COLUMN     "recoverySetupDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "securityAnswerHash" TEXT,
ADD COLUMN     "securityQuestion" TEXT;
