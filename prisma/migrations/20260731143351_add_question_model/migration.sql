-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "lesson" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT '',
    "questionText" TEXT NOT NULL,
    "questionImage" TEXT NOT NULL DEFAULT '',
    "options" TEXT[],
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL DEFAULT '',
    "explanationPdf" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "author" TEXT NOT NULL DEFAULT '',
    "year" INTEGER,
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Question_code_key" ON "Question"("code");

-- CreateIndex
CREATE INDEX "Question_lesson_idx" ON "Question"("lesson");

-- CreateIndex
CREATE INDEX "Question_grade_idx" ON "Question"("grade");

-- CreateIndex
CREATE INDEX "Question_major_idx" ON "Question"("major");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
