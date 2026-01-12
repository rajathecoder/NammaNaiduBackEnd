-- Migration: Change personId column from INTEGER to UUID in person_photos table
-- This version preserves existing data by mapping user.id to user.accountId
-- Run this script in your PostgreSQL database

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE person_photos 
DROP CONSTRAINT IF EXISTS person_photos_personId_fkey;

-- Step 2: Drop the unique index on personId (if exists)
DROP INDEX IF EXISTS person_photos_personId_unique;

-- Step 3: Add a temporary column to store UUID values
ALTER TABLE person_photos 
ADD COLUMN "personId_temp" UUID;

-- Step 4: Populate the temporary column with accountId from users table
UPDATE person_photos pp
SET "personId_temp" = u."accountId"
FROM users u
WHERE pp."personId"::text = u.id::text;

-- Step 5: Drop the old INTEGER column
ALTER TABLE person_photos 
DROP COLUMN "personId";

-- Step 6: Rename the temporary column to personId
ALTER TABLE person_photos 
RENAME COLUMN "personId_temp" TO "personId";

-- Step 7: Make the column NOT NULL
ALTER TABLE person_photos 
ALTER COLUMN "personId" SET NOT NULL;

-- Step 8: Recreate the foreign key constraint pointing to users.accountId
ALTER TABLE person_photos 
ADD CONSTRAINT person_photos_personId_fkey 
FOREIGN KEY ("personId") 
REFERENCES users("accountId") 
ON DELETE CASCADE;

-- Step 9: Recreate the unique index
CREATE UNIQUE INDEX IF NOT EXISTS person_photos_personId_unique 
ON person_photos("personId");
