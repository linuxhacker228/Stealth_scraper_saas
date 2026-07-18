-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ScrapeType" AS ENUM ('FAST', 'STEALTH');

-- CreateTable
CREATE TABLE "ScrapeTask" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "type" "ScrapeType" NOT NULL DEFAULT 'FAST',
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScrapeTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeResult" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "rawHtml" TEXT NOT NULL,
    "parsedData" JSONB,
    "erorrMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeResult_taskId_key" ON "ScrapeResult"("taskId");

-- AddForeignKey
ALTER TABLE "ScrapeResult" ADD CONSTRAINT "ScrapeResult_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ScrapeTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
