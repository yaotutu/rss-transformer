/*
  Warnings:

  - You are about to drop the column `guid` on the `Article` table. All the data in the column will be lost.
  - You are about to drop the column `rssSourceId` on the `Article` table. All the data in the column will be lost.
  - Added the required column `sourceUrl` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "articleId" TEXT,
    "articleGuid" TEXT,
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
    "updated" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_sourceUrl_fkey" FOREIGN KEY ("sourceUrl") REFERENCES "RssSource" ("sourceUrl") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("articleId", "articleUrl", "content", "contentAudio", "createdAt", "errorMessage", "id", "status", "summary", "summaryAudio", "title", "translatedAudio", "translatedContent", "translatedSummary", "updated", "updatedAt") SELECT "articleId", "articleUrl", "content", "contentAudio", "createdAt", "errorMessage", "id", "status", "summary", "summaryAudio", "title", "translatedAudio", "translatedContent", "translatedSummary", "updated", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_articleId_key" ON "Article"("articleId");
CREATE UNIQUE INDEX "Article_articleGuid_key" ON "Article"("articleGuid");
PRAGMA foreign_key_check("Article");
PRAGMA foreign_keys=ON;
