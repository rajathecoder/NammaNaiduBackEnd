-- Migration: Change personId column from INTEGER to UUID in person_photos table
-- Run this script in your PostgreSQL database
-- WARNING: This will delete all existing photo data!

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE person_photos 
DROP CONSTRAINT IF EXISTS person_photos_personId_fkey;

-- Step 2: Drop the unique index on personId (if exists)
DROP INDEX IF EXISTS person_photos_personId_unique;

-- Step 3: Delete all existing records (since we can't convert INTEGER to UUID directly)
TRUNCATE TABLE person_photos;

-- Step 4: Alter the column type from INTEGER to UUID
ALTER TABLE person_photos 
ALTER COLUMN "personId" TYPE UUID USING NULL;

-- Step 5: Make the column NOT NULL again
ALTER TABLE person_photos 
ALTER COLUMN "personId" SET NOT NULL;

-- Step 6: Recreate the foreign key constraint pointing to users.accountId
ALTER TABLE person_photos 
ADD CONSTRAINT person_photos_personId_fkey 
FOREIGN KEY ("personId") 
REFERENCES users("accountId") 
ON DELETE CASCADE;

-- Step 7: Recreate the unique index
CREATE UNIQUE INDEX IF NOT EXISTS person_photos_personId_unique 
ON person_photos("personId");
