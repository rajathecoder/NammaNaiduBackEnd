-- Fix data in basic_details table
-- This script ensures all accountId values are valid UUIDs matching users.accountId

-- Step 1: Check for any basic_details with invalid accountId data
SELECT 
    bd.id,
    bd."accountId",
    pg_typeof(bd."accountId") as accountId_type,
    CASE 
        WHEN bd."accountId"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Valid UUID'
        WHEN bd."accountId"::text ~ '^[0-9]+$' THEN 'Integer (needs update)'
        ELSE 'Invalid format'
    END as accountId_status,
    u.id as user_id,
    u."accountId" as user_accountId
FROM basic_details bd
LEFT JOIN users u ON bd."accountId" = u."accountId"
WHERE bd."accountId"::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   OR u."accountId" IS NULL;

-- Step 2: Update any basic_details where accountId doesn't match a valid user UUID
-- This handles cases where accountId might be an integer or invalid UUID
UPDATE basic_details bd
SET "accountId" = u."accountId"
FROM users u
WHERE (
    -- If accountId is an integer (as text), match by user id
    (bd."accountId"::text ~ '^[0-9]+$' AND u.id::text = bd."accountId"::text)
    OR
    -- If accountId doesn't match any user, try to match by user id
    (NOT EXISTS (
        SELECT 1 FROM users u2 WHERE u2."accountId" = bd."accountId"
    ) AND u.id::text = bd."accountId"::text)
)
AND bd."accountId" != u."accountId";

-- Step 3: Verify the fix
SELECT 
    COUNT(*) as total_basic_details,
    COUNT(CASE WHEN bd."accountId"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as valid_uuids,
    COUNT(CASE WHEN u."accountId" IS NOT NULL THEN 1 END) as matching_users
FROM basic_details bd
LEFT JOIN users u ON bd."accountId" = u."accountId";

-- Step 4: Show any remaining issues
SELECT 
    'Remaining issues' as status,
    COUNT(*) as count
FROM basic_details bd
LEFT JOIN users u ON bd."accountId" = u."accountId"
WHERE bd."accountId"::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
   OR u."accountId" IS NULL;




