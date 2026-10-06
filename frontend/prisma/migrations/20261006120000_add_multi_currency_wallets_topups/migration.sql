-- DropIndex
DROP INDEX "Wallet_userId_key";

-- AlterTable
-- Orders placed before this migration were priced in USD.
ALTER TABLE "Order" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE "Order" ALTER COLUMN "currency" SET DEFAULT 'MAD';

-- AlterTable
ALTER TABLE "GsmServiceOrder" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- CreateTable
CREATE TABLE "TopUpRequest" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "creditedAmount" DECIMAL(65,30),
    "method" TEXT NOT NULL,
    "bank" TEXT NOT NULL,
    "reference" TEXT,
    "receipt" BYTEA NOT NULL,
    "receiptType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopUpRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopUpRequest_status_createdAt_idx" ON "TopUpRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TopUpRequest_userId_createdAt_idx" ON "TopUpRequest"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_currency_key" ON "Wallet"("userId", "currency");

-- AddForeignKey
ALTER TABLE "TopUpRequest" ADD CONSTRAINT "TopUpRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

