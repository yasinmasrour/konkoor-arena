-- CreateTable
CREATE TABLE "AchievementFamily" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Trophy',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AchievementFamily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AchievementTier" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "conditionValue" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AchievementTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "totalPerfectScores" INTEGER NOT NULL DEFAULT 0,
    "totalHighScores90" INTEGER NOT NULL DEFAULT 0,
    "totalHighScores70" INTEGER NOT NULL DEFAULT 0,
    "current90Streak" INTEGER NOT NULL DEFAULT 0,
    "max90Streak" INTEGER NOT NULL DEFAULT 0,
    "current70Streak" INTEGER NOT NULL DEFAULT 0,
    "max70Streak" INTEGER NOT NULL DEFAULT 0,
    "currentAttemptStreak" INTEGER NOT NULL DEFAULT 0,
    "maxAttemptStreak" INTEGER NOT NULL DEFAULT 0,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "totalCorrect" INTEGER NOT NULL DEFAULT 0,
    "totalWrong" INTEGER NOT NULL DEFAULT 0,
    "perfectMath" INTEGER NOT NULL DEFAULT 0,
    "perfectPhysics" INTEGER NOT NULL DEFAULT 0,
    "perfectChemistry" INTEGER NOT NULL DEFAULT 0,
    "perfectBiology" INTEGER NOT NULL DEFAULT 0,
    "arenaWins" INTEGER NOT NULL DEFAULT 0,
    "arenaFirstRank" INTEGER NOT NULL DEFAULT 0,
    "fastAnswers" INTEGER NOT NULL DEFAULT 0,
    "earlyFinishes" INTEGER NOT NULL DEFAULT 0,
    "hasSubscription" BOOLEAN NOT NULL DEFAULT false,
    "membershipStart" TIMESTAMP(3),
    "achievementPoints" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AchievementFamily_code_key" ON "AchievementFamily"("code");

-- CreateIndex
CREATE INDEX "AchievementFamily_category_idx" ON "AchievementFamily"("category");

-- CreateIndex
CREATE INDEX "AchievementFamily_sortOrder_idx" ON "AchievementFamily"("sortOrder");

-- CreateIndex
CREATE INDEX "AchievementTier_familyId_idx" ON "AchievementTier"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "AchievementTier_familyId_tier_key" ON "AchievementTier"("familyId", "tier");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_seen_idx" ON "UserAchievement"("userId", "seen");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_tierId_key" ON "UserAchievement"("userId", "tierId");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- AddForeignKey
ALTER TABLE "AchievementTier" ADD CONSTRAINT "AchievementTier_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "AchievementFamily"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "AchievementTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
