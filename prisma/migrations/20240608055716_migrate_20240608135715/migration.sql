/*
  Warnings:

  - You are about to drop the `Article` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Article";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RssItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssSourceId" INTEGER NOT NULL,
    "articleId" TEXT,
    "articleGuid" TEXT,
    "articleUrl" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "status" TEXT,
    "updated" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RssItem_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssItemId" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Translation_rssItemId_fkey" FOREIGN KEY ("rssItemId") REFERENCES "RssItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
