/*
  Warnings:

  - You are about to drop the column `title` on the `thing` table. All the data in the column will be lost.
  - Added the required column `assignedToId` to the `thing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `thing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_thing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "assignedToId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    CONSTRAINT "thing_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "thing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_thing" ("createdAt", "createdById", "id", "updatedAt") SELECT "createdAt", "createdById", "id", "updatedAt" FROM "thing";
DROP TABLE "thing";
ALTER TABLE "new_thing" RENAME TO "thing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
