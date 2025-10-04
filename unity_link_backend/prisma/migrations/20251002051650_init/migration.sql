/*
  Warnings:

  - The `status` column on the `Event` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_EventAttendees` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `date` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('UPCOMING', 'PAST', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_communityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventAttendees" DROP CONSTRAINT "_EventAttendees_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventAttendees" DROP CONSTRAINT "_EventAttendees_B_fkey";

-- AlterTable
ALTER TABLE "public"."Event" ALTER COLUMN "date" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."EventStatus" NOT NULL DEFAULT 'UPCOMING';

-- DropTable
DROP TABLE "public"."_EventAttendees";

-- CreateTable
CREATE TABLE "public"."_EventCreatedBy" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventCreatedBy_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventCreatedBy_B_index" ON "public"."_EventCreatedBy"("B");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventCreatedBy" ADD CONSTRAINT "_EventCreatedBy_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventCreatedBy" ADD CONSTRAINT "_EventCreatedBy_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
