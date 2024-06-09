/*
  Warnings:

  - You are about to drop the column `taskStatus` on the `RssSource` table. All the data in the column will be lost.
  - You are about to drop the column `taskType` on the `RssSource` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "taskData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rssSourceId" INTEGER NOT NULL,
    CONSTRAINT "Task_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
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
INSERT INTO "new_RssSource" ("createdAt", "customName", "id", "rssID", "rssOriginInfo", "sourceUrl", "updatedAt") SELECT "createdAt", "customName", "id", "rssID", "rssOriginInfo", "sourceUrl", "updatedAt" FROM "RssSource";
DROP TABLE "RssSource";
ALTER TABLE "new_RssSource" RENAME TO "RssSource";
CREATE UNIQUE INDEX "RssSource_rssID_key" ON "RssSource"("rssID");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
