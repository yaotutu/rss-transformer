/*
  Warnings:

  - Added the required column `rssID` to the `RssSource` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "sourceTitle" TEXT NOT NULL,
    "rssID" TEXT NOT NULL,
    "customName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_RssSource" ("createdAt", "customName", "id", "sourceTitle", "sourceUrl", "updatedAt") SELECT "createdAt", "customName", "id", "sourceTitle", "sourceUrl", "updatedAt" FROM "RssSource";
DROP TABLE "RssSource";
ALTER TABLE "new_RssSource" RENAME TO "RssSource";
PRAGMA foreign_key_check("RssSource");
PRAGMA foreign_keys=ON;
