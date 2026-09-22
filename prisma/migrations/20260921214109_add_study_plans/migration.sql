-- CreateTable
CREATE TABLE "StudyPlan" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "examId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "lesson" TEXT,
    "chapter" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "estimatedMinutes" INTEGER,
    "dueDate" TIMESTAMP(3),
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalExam" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalExamQuestion" (
    "id" TEXT NOT NULL,
    "personalExamId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "selectedAnswer" INTEGER,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "answeredAt" TIMESTAMP(3),
    "questionTextSnapshot" TEXT,
    "questionImageSnapshot" TEXT,
    "optionsSnapshot" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "correctAnswerSnapshot" INTEGER,
    "explanationSnapshot" TEXT,
    "lessonSnapshot" TEXT,
    "chapterSnapshot" TEXT,
    "difficultySnapshot" TEXT,
    "scoreSnapshot" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalExamQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyPlan_studentId_status_idx" ON "StudyPlan"("studentId", "status");

-- CreateIndex
CREATE INDEX "StudyPlan_counselorId_status_idx" ON "StudyPlan"("counselorId", "status");

-- CreateIndex
CREATE INDEX "StudyPlan_examId_idx" ON "StudyPlan"("examId");

-- CreateIndex
CREATE INDEX "StudyPlan_status_endDate_idx" ON "StudyPlan"("status", "endDate");

-- CreateIndex
CREATE INDEX "StudyTask_planId_order_idx" ON "StudyTask"("planId", "order");

-- CreateIndex
CREATE INDEX "StudyTask_planId_isCompleted_idx" ON "StudyTask"("planId", "isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalExam_planId_key" ON "PersonalExam"("planId");

-- CreateIndex
CREATE INDEX "PersonalExam_studentId_status_idx" ON "PersonalExam"("studentId", "status");

-- CreateIndex
CREATE INDEX "PersonalExamQuestion_personalExamId_idx" ON "PersonalExamQuestion"("personalExamId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalExamQuestion_personalExamId_questionId_key" ON "PersonalExamQuestion"("personalExamId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalExamQuestion_personalExamId_order_key" ON "PersonalExamQuestion"("personalExamId", "order");

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalExam" ADD CONSTRAINT "PersonalExam_planId_fkey" FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalExam" ADD CONSTRAINT "PersonalExam_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalExamQuestion" ADD CONSTRAINT "PersonalExamQuestion_personalExamId_fkey" FOREIGN KEY ("personalExamId") REFERENCES "PersonalExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalExamQuestion" ADD CONSTRAINT "PersonalExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
