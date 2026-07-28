ALTER TABLE "Product"
  ADD COLUMN "imageBlobPath" TEXT,
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "Product_imageBlobPath_key"
  ON "Product"("imageBlobPath");
