-- CreateTable
CREATE TABLE "group" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "membership" (
    "personId" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "membership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "profile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "membership_personId_groupId_role_key" ON "membership"("personId", "groupId", "role");
