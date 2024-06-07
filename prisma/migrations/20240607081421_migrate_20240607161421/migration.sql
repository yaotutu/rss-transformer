/*
  Warnings:

  - You are about to drop the column `sourceUrl` on the `Article` table. All the data in the column will be lost.
  - Added the required column `rssSourceId` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "RssSource_sourceUrl_key";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssSourceId" INTEGER NOT NULL,
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
    CONSTRAINT "Article_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("articleGuid", "articleId", "articleUrl", "content", "contentAudio", "createdAt", "errorMessage", "id", "status", "summary", "summaryAudio", "title", "translatedAudio", "translatedContent", "translatedSummary", "updated", "updatedAt") SELECT "articleGuid", "articleId", "articleUrl", "content", "contentAudio", "createdAt", "errorMessage", "id", "status", "summary", "summaryAudio", "title", "translatedAudio", "translatedContent", "translatedSummary", "updated", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
PRAGMA foreign_key_check("Article");
PRAGMA foreign_keys=ON;
