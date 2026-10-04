-- CreateTable
CREATE TABLE "SiteInfo" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "phoneFixed" TEXT DEFAULT '',
    "phoneMobile" TEXT DEFAULT '',
    "emailMain" TEXT DEFAULT '',
    "emailSupport" TEXT DEFAULT '',
    "address" TEXT DEFAULT '',
    "instagramUrl" TEXT DEFAULT '',
    "telegramUrl" TEXT DEFAULT '',
    "aparatUrl" TEXT DEFAULT '',
    "workingHours" TEXT DEFAULT '',
    "aboutShort" TEXT DEFAULT '',
    "enamadEnabled" BOOLEAN NOT NULL DEFAULT false,
    "enamadHtml" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteInfo_pkey" PRIMARY KEY ("id")
);
