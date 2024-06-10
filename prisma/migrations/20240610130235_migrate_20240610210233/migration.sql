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
    "needsImmediateExecution" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rssSourceId" INTEGER NOT NULL,
    CONSTRAINT "Task_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("createdAt", "functionName", "id", "name", "rssSourceId", "schedule", "taskData", "taskType", "updatedAt") SELECT "createdAt", "functionName", "id", "name", "rssSourceId", "schedule", "taskData", "taskType", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE UNIQUE INDEX "Task_name_key" ON "Task"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
