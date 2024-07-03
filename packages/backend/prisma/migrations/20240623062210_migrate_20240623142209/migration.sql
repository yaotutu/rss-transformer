-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RssItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssSourceId" INTEGER NOT NULL,
    "feedType" TEXT,
    "uniqueArticleId" TEXT NOT NULL,
    "itemUrl" TEXT NOT NULL,
    "itemOriginInfo" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RssItem_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RssItem" ("createdAt", "feedType", "id", "itemOriginInfo", "itemUrl", "rssSourceId", "uniqueArticleId", "updatedAt") SELECT "createdAt", "feedType", "id", "itemOriginInfo", "itemUrl", "rssSourceId", "uniqueArticleId", "updatedAt" FROM "RssItem";
DROP TABLE "RssItem";
ALTER TABLE "new_RssItem" RENAME TO "RssItem";
CREATE TABLE "new_RssTransformed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssItemId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "uniqueArticleId" TEXT NOT NULL,
    "itemUrl" TEXT NOT NULL,
    "itemTransformedInfo" TEXT,
    "feedType" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RssTransformed_rssItemId_fkey" FOREIGN KEY ("rssItemId") REFERENCES "RssItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RssTransformed" ("createdAt", "feedType", "id", "itemTransformedInfo", "itemUrl", "rssItemId", "taskId", "uniqueArticleId", "updatedAt") SELECT "createdAt", "feedType", "id", "itemTransformedInfo", "itemUrl", "rssItemId", "taskId", "uniqueArticleId", "updatedAt" FROM "RssTransformed";
DROP TABLE "RssTransformed";
ALTER TABLE "new_RssTransformed" RENAME TO "RssTransformed";
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "taskData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "immediate" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rssSourceId" INTEGER NOT NULL,
    "rssSourceUrl" TEXT NOT NULL,
    CONSTRAINT "Task_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "functionName", "id", "immediate", "name", "rssSourceId", "rssSourceUrl", "schedule", "status", "taskData", "taskType", "updatedAt") SELECT "createdAt", "functionName", "id", "immediate", "name", "rssSourceId", "rssSourceUrl", "schedule", "status", "taskData", "taskType", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE UNIQUE INDEX "Task_name_key" ON "Task"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
