-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "readingTime" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "BlogPostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewDate" TEXT NOT NULL,

    CONSTRAINT "BlogPostView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPostView_postId_viewedAt_idx" ON "BlogPostView"("postId", "viewedAt");

-- CreateIndex
CREATE INDEX "BlogPostView_userId_viewedAt_idx" ON "BlogPostView"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostView_postId_ip_viewDate_key" ON "BlogPostView"("postId", "ip", "viewDate");

-- AddForeignKey
ALTER TABLE "BlogPostView" ADD CONSTRAINT "BlogPostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostView" ADD CONSTRAINT "BlogPostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
