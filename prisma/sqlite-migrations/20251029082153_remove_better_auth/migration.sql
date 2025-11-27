/*
  Warnings:

  - You are about to drop the `account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `identifier` on the `verification` table. All the data in the column will be lost.
  - Added the required column `variant` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN "password" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "account";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "variant" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);
INSERT INTO "new_verification" ("createdAt", "expiresAt", "id", "updatedAt", "value") SELECT "createdAt", "expiresAt", "id", "updatedAt", "value" FROM "verification";
DROP TABLE "verification";
ALTER TABLE "new_verification" RENAME TO "verification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
