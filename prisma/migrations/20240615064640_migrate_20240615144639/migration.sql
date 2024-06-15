/*
  Warnings:

  - You are about to drop the `Translation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Translation";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RssTransformed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssItemId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "uniqueArticleId" TEXT NOT NULL,
    "itemUrl" TEXT NOT NULL,
    "itemTransformedInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RssTransformed_rssItemId_fkey" FOREIGN KEY ("rssItemId") REFERENCES "RssItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RssTransformed_uniqueArticleId_key" ON "RssTransformed"("uniqueArticleId");
