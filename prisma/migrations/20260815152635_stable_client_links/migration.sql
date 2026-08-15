-- AlterTable
ALTER TABLE "ClientAccessToken" ADD COLUMN     "tokenCipher" TEXT,
ALTER COLUMN "expiresAt" DROP NOT NULL;
