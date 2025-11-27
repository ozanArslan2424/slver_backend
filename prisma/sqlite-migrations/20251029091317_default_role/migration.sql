-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "userId" TEXT NOT NULL,
    CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_profile" ("createdAt", "email", "id", "image", "name", "role", "updatedAt", "userId") SELECT "createdAt", "email", "id", "image", "name", "role", "updatedAt", "userId" FROM "profile";
DROP TABLE "profile";
ALTER TABLE "new_profile" RENAME TO "profile";
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
