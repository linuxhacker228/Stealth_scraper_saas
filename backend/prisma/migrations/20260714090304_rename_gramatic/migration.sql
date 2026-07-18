/*
  Warnings:

  - You are about to drop the column `erorrMessage` on the `ScrapeResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ScrapeResult" DROP COLUMN "erorrMessage",
ADD COLUMN     "errorMessage" TEXT;
