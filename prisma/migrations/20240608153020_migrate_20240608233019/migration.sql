/*
  Warnings:

  - Made the column `uniqueArticleId` on table `RssItem` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssSourceId" INTEGER NOT NULL,
    "uniqueArticleId" TEXT NOT NULL,
    "itemUrl" TEXT NOT NULL,
    "itemOriginInfo" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RssItem_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RssItem" ("createdAt", "id", "itemOriginInfo", "itemUrl", "rssSourceId", "uniqueArticleId", "updatedAt") SELECT "createdAt", "id", "itemOriginInfo", "itemUrl", "rssSourceId", "uniqueArticleId", "updatedAt" FROM "RssItem";
DROP TABLE "RssItem";
ALTER TABLE "new_RssItem" RENAME TO "RssItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
