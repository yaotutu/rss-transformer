/*
  Warnings:

  - You are about to drop the column `rssVsersion` on the `RssSource` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "customName" TEXT,
    "rssOriginInfo" TEXT,
    "feedType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_RssSource" ("createdAt", "customName", "id", "rssOriginInfo", "sourceUrl", "updatedAt") SELECT "createdAt", "customName", "id", "rssOriginInfo", "sourceUrl", "updatedAt" FROM "RssSource";
DROP TABLE "RssSource";
ALTER TABLE "new_RssSource" RENAME TO "RssSource";
CREATE UNIQUE INDEX "RssSource_sourceUrl_key" ON "RssSource"("sourceUrl");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
