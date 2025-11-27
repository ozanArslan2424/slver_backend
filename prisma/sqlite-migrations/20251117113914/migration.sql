/*
  Warnings:

  - A unique constraint covering the columns `[personId,groupId]` on the table `membership` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "membership_personId_groupId_role_key";

-- CreateIndex
CREATE UNIQUE INDEX "membership_personId_groupId_key" ON "membership"("personId", "groupId");
