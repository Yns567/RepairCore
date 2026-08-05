ALTER TABLE "Product"
  ADD COLUMN "image2" TEXT,
  ADD COLUMN "image2BlobPath" TEXT,
  ADD COLUMN "image3" TEXT,
  ADD COLUMN "image3BlobPath" TEXT;

CREATE UNIQUE INDEX "Product_image2BlobPath_key"
  ON "Product"("image2BlobPath");

CREATE UNIQUE INDEX "Product_image3BlobPath_key"
  ON "Product"("image3BlobPath");
