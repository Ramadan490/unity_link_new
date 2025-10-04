/*
  Warnings:

  - You are about to drop the column `createdById` on the `Memorial` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `communityId` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `communityId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `tributeCount` on table `Memorial` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `communityId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `communityId` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Memorial" DROP CONSTRAINT "Memorial_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventRSVPs" DROP CONSTRAINT "_EventRSVPs_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventRSVPs" DROP CONSTRAINT "_EventRSVPs_B_fkey";

-- AlterTable
ALTER TABLE "public"."Announcement" ADD COLUMN     "communityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "communityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Memorial" DROP COLUMN "createdById",
ADD COLUMN     "communityId" TEXT,
ALTER COLUMN "tributeCount" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "communityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Request" ADD COLUMN     "communityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "address",
DROP COLUMN "phone",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'community_member';

-- DropTable
DROP TABLE "public"."Profile";

-- CreateTable
CREATE TABLE "public"."Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "superAdminId" TEXT NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityMember" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Community" ADD CONSTRAINT "Community_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Memorial" ADD CONSTRAINT "Memorial_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventRSVPs" ADD CONSTRAINT "_EventRSVPs_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."CommunityMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_EventRSVPs" ADD CONSTRAINT "_EventRSVPs_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
