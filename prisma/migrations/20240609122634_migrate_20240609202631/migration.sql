/*
  Warnings:

  - You are about to drop the column `rssID` on the `RssSource` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Task` will be added. If there are existing duplicate values, this will fail.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "customName" TEXT,
    "rssOriginInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_RssSource" ("createdAt", "customName", "id", "rssOriginInfo", "sourceUrl", "updatedAt") SELECT "createdAt", "customName", "id", "rssOriginInfo", "sourceUrl", "updatedAt" FROM "RssSource";
DROP TABLE "RssSource";
ALTER TABLE "new_RssSource" RENAME TO "RssSource";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Task_name_key" ON "Task"("name");
