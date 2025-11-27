-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Attachment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" REAL NOT NULL,
    "createdById" INTEGER NOT NULL,
    "thingId" INTEGER NOT NULL,
    CONSTRAINT "Attachment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attachment_thingId_fkey" FOREIGN KEY ("thingId") REFERENCES "thing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Attachment" ("createdAt", "createdById", "id", "size", "thingId", "type", "updatedAt", "url") SELECT "createdAt", "createdById", "id", "size", "thingId", "type", "updatedAt", "url" FROM "Attachment";
DROP TABLE "Attachment";
ALTER TABLE "new_Attachment" RENAME TO "Attachment";
CREATE TABLE "new_comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" INTEGER NOT NULL,
    CONSTRAINT "comment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_comment" ("content", "createdAt", "createdById", "id", "updatedAt") SELECT "content", "createdAt", "createdById", "id", "updatedAt" FROM "comment";
DROP TABLE "comment";
ALTER TABLE "new_comment" RENAME TO "comment";
CREATE TABLE "new_profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'user',
    "userId" TEXT NOT NULL,
    CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_profile" ("createdAt", "email", "id", "image", "name", "role", "updatedAt", "userId") SELECT "createdAt", "email", "id", "image", "name", "role", "updatedAt", "userId" FROM "profile";
DROP TABLE "profile";
ALTER TABLE "new_profile" RENAME TO "profile";
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");
CREATE TABLE "new_thing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "assignedToId" INTEGER,
    "createdById" INTEGER NOT NULL,
    CONSTRAINT "thing_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "profile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "thing_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_thing" ("assignedToId", "content", "createdAt", "createdById", "id", "updatedAt") SELECT "assignedToId", "content", "createdAt", "createdById", "id", "updatedAt" FROM "thing";
DROP TABLE "thing";
ALTER TABLE "new_thing" RENAME TO "thing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
