-- Fix pets table schema to match the current code
-- Remove extra columns that shouldn't be in pets table
ALTER TABLE "pets" DROP COLUMN IF EXISTS "size";
ALTER TABLE "pets" DROP COLUMN IF EXISTS "activity_level";
ALTER TABLE "pets" DROP COLUMN IF EXISTS "grooming_needs";
ALTER TABLE "pets" DROP COLUMN IF EXISTS "training_difficulty";
ALTER TABLE "pets" DROP COLUMN IF EXISTS "profile_image";

-- Add missing columns that should be in pets table
ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "neutered" boolean;
ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "image_url" text; 