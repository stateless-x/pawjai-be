-- Remove weight_kg column from pets table
-- This migration is safe to run multiple times
ALTER TABLE "pets" DROP COLUMN IF EXISTS "weight_kg";

-- Add any missing columns that should exist according to the current schema
ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "neutered" boolean;
ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "notes" text;
ALTER TABLE "pets" ADD COLUMN IF NOT EXISTS "image_url" text; 