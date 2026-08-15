-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "dietaryPreference" TEXT,
ADD COLUMN     "foodRestrictions" TEXT,
ADD COLUMN     "mealTiming" TEXT,
ADD COLUMN     "sleepHours" DECIMAL(4,2),
ADD COLUMN     "waterLiters" DECIMAL(4,2);

-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "summary" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "intakeReviewedAt" TIMESTAMP(3),
ADD COLUMN     "intakeSubmittedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ClientAccessToken" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'INTAKE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccessToken_tokenHash_key" ON "ClientAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ClientAccessToken_clientId_idx" ON "ClientAccessToken"("clientId");

-- CreateIndex
CREATE INDEX "ClientAccessToken_expiresAt_idx" ON "ClientAccessToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "ClientAccessToken" ADD CONSTRAINT "ClientAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
