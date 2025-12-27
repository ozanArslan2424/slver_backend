/*
  Warnings:

  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `verification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "verification" DROP CONSTRAINT "verification_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("userId", "value");
