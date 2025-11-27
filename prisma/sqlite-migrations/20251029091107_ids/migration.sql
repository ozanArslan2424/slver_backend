/*
  Warnings:

  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `session` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `verification` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_session" ("createdAt", "expiresAt", "id", "ipAddress", "token", "updatedAt", "userAgent", "userId") SELECT "createdAt", "expiresAt", "id", "ipAddress", "token", "updatedAt", "userAgent", "userId" FROM "session";
DROP TABLE "session";
ALTER TABLE "new_session" RENAME TO "session";
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");
CREATE TABLE "new_verification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "variant" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);
INSERT INTO "new_verification" ("createdAt", "expiresAt", "id", "updatedAt", "value", "variant") SELECT "createdAt", "expiresAt", "id", "updatedAt", "value", "variant" FROM "verification";
DROP TABLE "verification";
ALTER TABLE "new_verification" RENAME TO "verification";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
