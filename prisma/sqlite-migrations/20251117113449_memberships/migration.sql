/*
  Warnings:

  - Added the required column `password` to the `membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `membership` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_membership" (
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "personId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    CONSTRAINT "membership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_membership" ("groupId", "personId", "role") SELECT "groupId", "personId", "role" FROM "membership";
DROP TABLE "membership";
ALTER TABLE "new_membership" RENAME TO "membership";
CREATE UNIQUE INDEX "membership_personId_groupId_role_key" ON "membership"("personId", "groupId", "role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
