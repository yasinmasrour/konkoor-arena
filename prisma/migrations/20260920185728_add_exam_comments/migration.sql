-- CreateTable
CREATE TABLE "ExamComment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentReaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamComment_examId_status_createdAt_idx" ON "ExamComment"("examId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ExamComment_userId_createdAt_idx" ON "ExamComment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExamComment_parentId_status_createdAt_idx" ON "ExamComment"("parentId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ExamComment_status_createdAt_idx" ON "ExamComment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CommentReaction_commentId_type_idx" ON "CommentReaction"("commentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_userId_commentId_key" ON "CommentReaction"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "ExamComment" ADD CONSTRAINT "ExamComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamComment" ADD CONSTRAINT "ExamComment_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamComment" ADD CONSTRAINT "ExamComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ExamComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamComment" ADD CONSTRAINT "ExamComment_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "ExamComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
