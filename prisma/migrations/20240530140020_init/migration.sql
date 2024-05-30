/*
  Warnings:

  - You are about to drop the `RssFeed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `rssFeedId` on the `Article` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "RssFeed_url_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RssFeed";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guid" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "updated" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Article" ("content", "createdAt", "guid", "id", "title", "updated", "updatedAt", "url") SELECT "content", "createdAt", "guid", "id", "title", "updated", "updatedAt", "url" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_guid_key" ON "Article"("guid");
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
CREATE INDEX "Article_updated_idx" ON "Article"("updated");
PRAGMA foreign_key_check("Article");
PRAGMA foreign_keys=ON;
