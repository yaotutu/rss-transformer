/*
  Warnings:

  - A unique constraint covering the columns `[sourceUrl]` on the table `RssSource` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RssSource_sourceUrl_key" ON "RssSource"("sourceUrl");
