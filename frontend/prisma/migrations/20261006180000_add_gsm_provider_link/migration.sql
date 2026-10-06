-- AlterTable
ALTER TABLE "GsmService" ADD COLUMN     "customFieldName" TEXT,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "priceLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "providerCost" DECIMAL(65,30),
ADD COLUMN     "syncedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "GsmServiceOrder" ADD COLUMN     "externalReference" TEXT,
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "submitError" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "GsmService_externalId_key" ON "GsmService"("externalId");

