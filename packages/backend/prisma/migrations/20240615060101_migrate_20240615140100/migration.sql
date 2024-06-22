-- CreateTable
CREATE TABLE "RssSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sourceUrl" TEXT NOT NULL,
    "customName" TEXT,
    "rssOriginInfo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RssItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rssSourceId" INTEGER NOT NULL,
    "uniqueArticleId" TEXT NOT NULL,
    "itemUrl" TEXT NOT NULL,
    "itemOriginInfo" TEXT,
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

-- CreateTable
CREATE TABLE "Task" (
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
    CONSTRAINT "Task_rssSourceId_fkey" FOREIGN KEY ("rssSourceId") REFERENCES "RssSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RssSource_sourceUrl_key" ON "RssSource"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Task_name_key" ON "Task"("name");
