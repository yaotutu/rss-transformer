/*
  Warnings:

  - You are about to drop the column `articleGuid` on the `RssItem` table. All the data in the column will be lost.
  - You are about to drop the column `articleId` on the `RssItem` table. All the data in the column will be lost.
  - You are about to drop the column `articleUrl` on the `RssItem` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `RssItem` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `RssItem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `RssItem` table. All the data in the column will be lost.
  - Added the required column `itemUrl` to the `RssItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssSourceId" INTEGER NOT NULL,
    "uniqueArticleId" TEXT,
    "itemId" TEXT,
    "itemGuid" TEXT,
    "itemUrl" TEXT NOT NULL,
    "itemOriginInfo" TEXT,
    "updated" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RssItem_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RssItem" ("createdAt", "id", "rssSourceId", "updated", "updatedAt") SELECT "createdAt", "id", "rssSourceId", "updated", "updatedAt" FROM "RssItem";
DROP TABLE "RssItem";
ALTER TABLE "new_RssItem" RENAME TO "RssItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
