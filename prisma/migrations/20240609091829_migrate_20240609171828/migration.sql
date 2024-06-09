/*
  Warnings:

  - Added the required column `functionName` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskType` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "taskData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "rssSourceId" INTEGER NOT NULL,
    CONSTRAINT "Task_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "id", "name", "rssSourceId", "schedule", "taskData", "updatedAt") SELECT "createdAt", "id", "name", "rssSourceId", "schedule", "taskData", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
