ALTER TABLE "Habit" ADD COLUMN "shareId" TEXT;
ALTER TABLE "Habit" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Habit_shareId_key" ON "Habit"("shareId");