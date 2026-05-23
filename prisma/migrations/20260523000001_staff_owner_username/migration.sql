-- AlterEnum: add STAFF and OWNER to Role (idempotent)
DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE 'STAFF';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE "Role" ADD VALUE 'OWNER';
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- AlterTable: add username column to User (idempotent)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Create unique index on username if not exists
DO $$ BEGIN
  CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
EXCEPTION WHEN duplicate_table THEN null;
END $$;
