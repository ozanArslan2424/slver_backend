/*
  Warnings:

  - Added the required column `password` to the `group` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_group" ("createdAt", "id", "title", "updatedAt") SELECT "createdAt", "id", "title", "updatedAt" FROM "group";
DROP TABLE "group";
ALTER TABLE "new_group" RENAME TO "group";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
