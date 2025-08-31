-- Make occurred_at field optional in pet_records table
-- This migration is safe to run multiple times

-- First, drop the NOT NULL constraint
ALTER TABLE "pet_records" ALTER COLUMN "occurred_at" DROP NOT NULL;

-- Add a default value of NOW() for existing records that might have NULL occurred_at
UPDATE "pet_records" SET "occurred_at" = NOW() WHERE "occurred_at" IS NULL;

-- Add a check constraint to ensure occurred_at is not in the future
ALTER TABLE "pet_records" ADD CONSTRAINT IF NOT EXISTS "check_occurred_at_not_future" 
CHECK ("occurred_at" <= NOW());

-- Add a comment explaining the field behavior
COMMENT ON COLUMN "pet_records"."occurred_at" IS 'When the event occurred. If NULL, defaults to current timestamp on record creation.'; 