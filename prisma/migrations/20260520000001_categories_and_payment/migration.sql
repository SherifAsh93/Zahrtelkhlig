-- AlterTable: add seasonal and sortOrder to Category
ALTER TABLE "Category" ADD COLUMN "seasonal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterEnum: add BANK_TRANSFER to PaymentMethod
ALTER TYPE "PaymentMethod" ADD VALUE 'BANK_TRANSFER';
