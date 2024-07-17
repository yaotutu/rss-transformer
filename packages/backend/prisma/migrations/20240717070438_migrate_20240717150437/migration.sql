/*
  Warnings:

  - You are about to drop the column `itemOriginDate` on the `RssTransformed` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssTransformed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssItemId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "uniqueArticleId" TEXT NOT NULL,
    "itemUrl" TEXT NOT NULL,
    "itemTransformedInfo" TEXT,
    "itemDate" TEXT,
    "feedType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RssTransformed_rssItemId_fkey" FOREIGN KEY ("rssItemId") REFERENCES "RssItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RssTransformed" ("createdAt", "feedType", "id", "itemTransformedInfo", "itemUrl", "rssItemId", "taskId", "uniqueArticleId", "updatedAt") SELECT "createdAt", "feedType", "id", "itemTransformedInfo", "itemUrl", "rssItemId", "taskId", "uniqueArticleId", "updatedAt" FROM "RssTransformed";
DROP TABLE "RssTransformed";
ALTER TABLE "new_RssTransformed" RENAME TO "RssTransformed";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
