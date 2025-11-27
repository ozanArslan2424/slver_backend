/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");
