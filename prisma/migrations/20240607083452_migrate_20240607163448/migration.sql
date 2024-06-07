/*
  Warnings:

  - A unique constraint covering the columns `[rssID]` on the table `RssSource` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RssSource_rssID_key" ON "RssSource"("rssID");
