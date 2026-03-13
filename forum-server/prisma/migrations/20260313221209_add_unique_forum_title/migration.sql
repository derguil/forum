/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Forum` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Forum_title_key` ON `Forum`(`title`);
