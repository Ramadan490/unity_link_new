/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Community` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Community" ADD COLUMN     "superAdminId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Community_name_key" ON "public"."Community"("name");

-- AddForeignKey
ALTER TABLE "public"."Community" ADD CONSTRAINT "Community_superAdminId_fkey" FOREIGN KEY ("superAdminId") REFERENCES "public"."Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
