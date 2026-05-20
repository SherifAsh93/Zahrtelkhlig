-- AlterTable: add seasonal and sortOrder to Category (idempotent)
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "seasonal" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterEnum: add BANK_TRANSFER to PaymentMethod (idempotent)
DO $$ BEGIN
  ALTER TYPE "PaymentMethod" ADD VALUE 'BANK_TRANSFER';
EXCEPTION WHEN duplicate_object THEN null;
END $$;
