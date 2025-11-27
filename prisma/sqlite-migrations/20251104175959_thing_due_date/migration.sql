-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_thing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneDate" DATETIME,
    "dueDate" DATETIME,
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
