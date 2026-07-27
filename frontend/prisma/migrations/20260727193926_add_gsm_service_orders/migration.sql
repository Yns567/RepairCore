-- CreateTable
CREATE TABLE "GsmService" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "provider" TEXT,
    "inputType" TEXT NOT NULL DEFAULT 'NONE',
    "estimatedTime" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "image" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GsmService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GsmServiceOrder" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" DECIMAL(65,30) NOT NULL,
    "imei" TEXT,
    "accountUsername" TEXT,
    "deviceModel" TEXT,
    "notes" TEXT,
    "result" TEXT,
    "authorizationConfirmedAt" TIMESTAMP(3) NOT NULL,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GsmServiceOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GsmService_slug_key" ON "GsmService"("slug");

-- CreateIndex
CREATE INDEX "GsmService_category_status_idx" ON "GsmService"("category", "status");

-- CreateIndex
CREATE INDEX "GsmServiceOrder_userId_createdAt_idx" ON "GsmServiceOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GsmServiceOrder_status_createdAt_idx" ON "GsmServiceOrder"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "GsmServiceOrder" ADD CONSTRAINT "GsmServiceOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GsmServiceOrder" ADD CONSTRAINT "GsmServiceOrder_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "GsmService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
