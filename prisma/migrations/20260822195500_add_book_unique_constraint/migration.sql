/*
  Warnings:

  - A unique constraint covering the columns `[title,author,releaseYear]` on the table `Book` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Book_title_author_releaseYear_key" ON "Book"("title", "author", "releaseYear");
