-- CreateTable
CREATE TABLE "seen_status" (
    "personId" INTEGER NOT NULL,
    "thingId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "seen_status_personId_thingId_key" ON "seen_status"("personId", "thingId");

-- AddForeignKey
ALTER TABLE "seen_status" ADD CONSTRAINT "seen_status_personId_fkey" FOREIGN KEY ("personId") REFERENCES "profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seen_status" ADD CONSTRAINT "seen_status_thingId_fkey" FOREIGN KEY ("thingId") REFERENCES "thing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
