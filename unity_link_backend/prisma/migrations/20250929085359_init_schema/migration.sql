/*
  Warnings:

  - You are about to drop the column `authorId` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Announcement` table. All the data in the column will be lost.
  - You are about to drop the column `superAdminId` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `dates` on the `Memorial` table. All the data in the column will be lost.
  - You are about to drop the column `tributeCount` on the `Memorial` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Reply` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the `CommunityMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_EventRSVPs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdById` to the `Announcement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Memorial` table without a default value. This is not possible if the table is not empty.
  - Made the column `communityId` on table `Memorial` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `createdById` to the `Reply` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Announcement" DROP CONSTRAINT "Announcement_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Community" DROP CONSTRAINT "Community_superAdminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityMember" DROP CONSTRAINT "CommunityMember_communityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommunityMember" DROP CONSTRAINT "CommunityMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_memorialId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Memorial" DROP CONSTRAINT "Memorial_communityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_communityId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Reply" DROP CONSTRAINT "Reply_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Request" DROP CONSTRAINT "Request_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventRSVPs" DROP CONSTRAINT "_EventRSVPs_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_EventRSVPs" DROP CONSTRAINT "_EventRSVPs_B_fkey";

-- AlterTable
ALTER TABLE "public"."Announcement" DROP COLUMN "authorId",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Community" DROP COLUMN "superAdminId";

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "details",
DROP COLUMN "location",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Memorial" DROP COLUMN "dates",
DROP COLUMN "tributeCount",
ADD COLUMN     "createdById" TEXT NOT NULL,
ALTER COLUMN "communityId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Reply" DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Request" DROP COLUMN "content",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."CommunityMember";

-- DropTable
DROP TABLE "public"."Image";

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."_EventRSVPs";

-- CreateTable
CREATE TABLE "public"."Profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "public"."Profile"("email");

-- AddForeignKey
ALTER TABLE "public"."Memorial" ADD CONSTRAINT "Memorial_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Memorial" ADD CONSTRAINT "Memorial_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Request" ADD CONSTRAINT "Request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reply" ADD CONSTRAINT "Reply_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
