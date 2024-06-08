/*
  Warnings:

  - You are about to drop the column `sourceTitle` on the `RssSource` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "rssID" TEXT NOT NULL,
    "customName" TEXT,
    "rssOriginInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_RssSource" ("createdAt", "customName", "id", "rssID", "sourceUrl", "updatedAt") SELECT "createdAt", "customName", "id", "rssID", "sourceUrl", "updatedAt" FROM "RssSource";
DROP TABLE "RssSource";
ALTER TABLE "new_RssSource" RENAME TO "RssSource";
CREATE UNIQUE INDEX "RssSource_rssID_key" ON "RssSource"("rssID");
PRAGMA foreign_key_check("RssSource");
PRAGMA foreign_keys=ON;
