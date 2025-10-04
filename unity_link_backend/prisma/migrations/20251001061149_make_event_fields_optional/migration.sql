/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_communityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_createdById_fkey";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "createdAt",
DROP COLUMN "createdById",
ADD COLUMN     "attending" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "donations" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "status" TEXT,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "communityId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."_EventToProfile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToProfile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventToProfile_B_index" ON "public"."_EventToProfile"("B");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToProfile" ADD CONSTRAINT "_EventToProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventToProfile" ADD CONSTRAINT "_EventToProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
