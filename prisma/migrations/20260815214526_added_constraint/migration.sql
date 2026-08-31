/*
  Warnings:

  - A unique constraint covering the columns `[userId,bookId]` on the table `ReadListItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReadListItem_userId_bookId_key" ON "ReadListItem"("userId", "bookId");
