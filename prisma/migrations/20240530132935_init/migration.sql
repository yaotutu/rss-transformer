/*
  Warnings:

  - Added the required column `guid` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guid" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "updated" DATETIME NOT NULL,
    "rssFeedId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_rssFeedId_fkey" FOREIGN KEY ("rssFeedId") REFERENCES "RssFeed" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("content", "createdAt", "id", "rssFeedId", "title", "updated", "updatedAt", "url") SELECT "content", "createdAt", "id", "rssFeedId", "title", "updated", "updatedAt", "url" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_guid_key" ON "Article"("guid");
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");
CREATE INDEX "Article_rssFeedId_updated_idx" ON "Article"("rssFeedId", "updated");
PRAGMA foreign_key_check("Article");
PRAGMA foreign_keys=ON;
