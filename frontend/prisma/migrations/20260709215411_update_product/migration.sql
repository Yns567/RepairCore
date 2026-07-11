/*
  Warnings:

  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "partNumber" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
