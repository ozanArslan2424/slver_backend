/*
  Warnings:

  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - Added the required column `userId` to the `verification` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "session_token_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "session";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL
);
INSERT INTO "new_user" ("createdAt", "email", "emailVerified", "id", "password", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "password", "updatedAt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE TABLE "new_verification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "variant" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_verification" ("createdAt", "expiresAt", "id", "updatedAt", "value", "variant") SELECT "createdAt", "expiresAt", "id", "updatedAt", "value", "variant" FROM "verification";
DROP TABLE "verification";
ALTER TABLE "new_verification" RENAME TO "verification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
