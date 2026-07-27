ALTER TABLE "GsmServiceOrder"
ADD COLUMN "clientRequestId" TEXT;

CREATE UNIQUE INDEX "GsmServiceOrder_clientRequestId_key"
ON "GsmServiceOrder"("clientRequestId");
