/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Article` table. All the data in the column will be lost.
  - Added the required column `articleUrl` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rssSourceId` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "RssSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssSourceId" INTEGER NOT NULL,
    "articleId" TEXT,
    "guid" TEXT,
    "articleUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "translatedContent" TEXT,
    "summary" TEXT,
    "translatedSummary" TEXT,
    "contentAudio" TEXT,
    "summaryAudio" TEXT,
    "translatedAudio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "errorMessage" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "updated" DATETIME,
    CONSTRAINT "Article_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("content", "guid", "id", "title", "updated", "updatedAt") SELECT "content", "guid", "id", "title", "updated", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_articleId_key" ON "Article"("articleId");
CREATE UNIQUE INDEX "Article_guid_key" ON "Article"("guid");
PRAGMA foreign_key_check("Article");
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "RssSource_sourceUrl_key" ON "RssSource"("sourceUrl");
