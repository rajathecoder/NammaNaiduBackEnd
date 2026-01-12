-- Fix accountId column type in basic_details table
-- This script checks and converts the accountId column from INTEGER to UUID if needed

-- Step 1: Check current column type
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'basic_details' 
AND column_name = 'accountId';

-- Step 2: If column exists and is INTEGER, convert it to UUID
DO $$
DECLARE
    current_type TEXT;
    col_exists BOOLEAN;
BEGIN
    -- Check if column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns
        WHERE table_name = 'basic_details' 
        AND column_name = 'accountId'
    ) INTO col_exists;
    
    IF NOT col_exists THEN
        RAISE NOTICE 'accountId column does not exist. Please run the initial migration first.';
        RETURN;
    END IF;
    
    -- Get the current data type
    SELECT data_type INTO current_type
    FROM information_schema.columns
    WHERE table_name = 'basic_details' 
    AND column_name = 'accountId';
    
    RAISE NOTICE 'Current accountId type: %', current_type;
    
    -- If it's integer, we need to convert it
    IF current_type = 'integer' THEN
        RAISE NOTICE 'Converting accountId from INTEGER to UUID...';
        
        -- First, update any integer accountIds to match users.accountId
        -- This handles the case where accountId contains user IDs instead of UUIDs
        UPDATE basic_details bd
        SET "accountId" = u."accountId"
        FROM users u
        WHERE bd."accountId"::text = u.id::text
        AND bd."accountId"::text != u."accountId"::text;
        
        -- Drop constraints temporarily
        ALTER TABLE basic_details 
        DROP CONSTRAINT IF EXISTS basic_details_accountId_fkey;
        
        ALTER TABLE basic_details 
        DROP CONSTRAINT IF EXISTS basic_details_accountId_unique;
        
        DROP INDEX IF EXISTS idx_basic_details_accountId;
        
        -- Change column type to UUID
        -- Convert integer values to UUID by looking up in users table
        ALTER TABLE basic_details 
        ALTER COLUMN "accountId" TYPE UUID USING (
            CASE 
                WHEN "accountId"::text ~ '^[0-9]+$' THEN
                    -- If it's a number, get the UUID from users table
                    (SELECT u."accountId" FROM users u WHERE u.id = ("accountId"::text)::integer LIMIT 1)
                ELSE
                    -- If it's already a UUID string, cast it
                    "accountId"::text::UUID
            END
        );
        
        -- Re-add constraints
        ALTER TABLE basic_details 
        ADD CONSTRAINT basic_details_accountId_unique UNIQUE ("accountId");
        
        ALTER TABLE basic_details 
        ADD CONSTRAINT basic_details_accountId_fkey 
        FOREIGN KEY ("accountId") 
        REFERENCES users("accountId") 
        ON DELETE CASCADE;
        
        -- Recreate index
        CREATE INDEX IF NOT EXISTS idx_basic_details_accountId ON basic_details("accountId");
        
        RAISE NOTICE 'Successfully converted accountId from INTEGER to UUID';
    ELSIF current_type = 'uuid' THEN
        RAISE NOTICE 'accountId is already UUID type. No changes needed.';
    ELSE
        RAISE NOTICE 'accountId type is: %. Expected INTEGER or UUID.', current_type;
    END IF;
END $$;

-- Step 3: Verify the change
SELECT 
    column_name, 
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'basic_details' 
AND column_name = 'accountId';
