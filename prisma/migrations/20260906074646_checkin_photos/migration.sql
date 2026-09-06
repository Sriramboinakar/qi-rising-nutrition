-- AlterTable
ALTER TABLE "ProgressPhoto" ADD COLUMN     "checkInId" TEXT;

-- CreateIndex
CREATE INDEX "ProgressPhoto_checkInId_idx" ON "ProgressPhoto"("checkInId");

-- AddForeignKey
ALTER TABLE "ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
