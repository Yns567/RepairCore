-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- Preserve any existing development cart rows in a single legacy cart.
WITH "legacyCart" AS (
    INSERT INTO "Cart" ("sessionId", "updatedAt")
    VALUES ('legacy-cart', CURRENT_TIMESTAMP)
    RETURNING "id"
)
INSERT INTO "Cart" ("sessionId", "updatedAt")
SELECT 'legacy-cart-empty', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "legacyCart");

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN "cartId" INTEGER;

UPDATE "CartItem"
SET "cartId" = (SELECT "id" FROM "Cart" WHERE "sessionId" = 'legacy-cart' LIMIT 1)
WHERE "cartId" IS NULL;

ALTER TABLE "CartItem" ALTER COLUMN "cartId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Cart_sessionId_key" ON "Cart"("sessionId");
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey"
FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
