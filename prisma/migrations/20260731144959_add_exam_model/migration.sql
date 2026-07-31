-- CreateTable
CREATE TABLE "Booklet" (
    "id" TEXT NOT NULL,
    "lesson" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booklet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookletQuestion" (
    "id" TEXT NOT NULL,
    "bookletId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookletQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookletId" TEXT,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamBooklet" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "bookletId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamBooklet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookletQuestion_bookletId_questionId_key" ON "BookletQuestion"("bookletId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamBooklet_examId_bookletId_key" ON "ExamBooklet"("examId", "bookletId");

-- AddForeignKey
ALTER TABLE "Booklet" ADD CONSTRAINT "Booklet_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookletQuestion" ADD CONSTRAINT "BookletQuestion_bookletId_fkey" FOREIGN KEY ("bookletId") REFERENCES "Booklet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookletQuestion" ADD CONSTRAINT "BookletQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_bookletId_fkey" FOREIGN KEY ("bookletId") REFERENCES "Booklet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamBooklet" ADD CONSTRAINT "ExamBooklet_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamBooklet" ADD CONSTRAINT "ExamBooklet_bookletId_fkey" FOREIGN KEY ("bookletId") REFERENCES "Booklet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
