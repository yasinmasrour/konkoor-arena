ALTER TABLE "User"
  ADD COLUMN "phoneNumber" TEXT,
  ADD COLUMN "phoneVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "birthDate" TIMESTAMP(3),
  ADD COLUMN "major" TEXT,
  ADD COLUMN "grade" TEXT,
  ADD COLUMN "nationalId" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "province" TEXT;

ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
CREATE UNIQUE INDEX "User_nationalId_key" ON "User"("nationalId");

CREATE TABLE "VerificationCode" (
  "id" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VerificationCode_phoneNumber_purpose_createdAt_idx"
  ON "VerificationCode"("phoneNumber", "purpose", "createdAt");
