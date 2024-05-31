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
    "updated" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Article_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("articleId", "articleUrl", "content", "contentAudio", "errorMessage", "guid", "id", "rssSourceId", "status", "summary", "summaryAudio", "title", "translatedAudio", "translatedContent", "translatedSummary", "updated", "updatedAt") SELECT "articleId", "articleUrl", "content", "contentAudio", "errorMessage", "guid", "id", "rssSourceId", "status", "summary", "summaryAudio", "title", "translatedAudio", "translatedContent", "translatedSummary", "updated", "updatedAt" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_articleId_key" ON "Article"("articleId");
CREATE UNIQUE INDEX "Article_guid_key" ON "Article"("guid");
PRAGMA foreign_key_check("Article");
PRAGMA foreign_keys=ON;
