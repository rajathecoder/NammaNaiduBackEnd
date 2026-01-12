-- Migration: Add profileverified and proofverified fields to basic_details table
-- Run this script in your PostgreSQL database

-- Step 1: Add profileverified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'basic_details' 
        AND column_name = 'profileverified'
    ) THEN
        ALTER TABLE basic_details 
        ADD COLUMN profileverified INTEGER DEFAULT 0;
    END IF;
END $$;

-- Step 2: Add proofverified column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'basic_details' 
        AND column_name = 'proofverified'
    ) THEN
        ALTER TABLE basic_details 
        ADD COLUMN proofverified INTEGER DEFAULT 0;
    END IF;
END $$;

-- Step 3: Update existing records to have default value 0
UPDATE basic_details 
SET profileverified = 0 
WHERE profileverified IS NULL;

UPDATE basic_details 
SET proofverified = 0 
WHERE proofverified IS NULL;

-- Step 4: Add comments to columns
COMMENT ON COLUMN basic_details.profileverified IS 'Profile verification status: 0 = not verified, 1 = verified';
COMMENT ON COLUMN basic_details.proofverified IS 'Proof document verification status: 0 = not verified, 1 = verified';
