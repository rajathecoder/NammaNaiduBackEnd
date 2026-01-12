-- Check the actual data in basic_details table
-- This will help identify if the data values are correct

-- Check accountId values and their types
SELECT 
    id,
    "accountId",
    pg_typeof("accountId") as accountId_type,
    CASE 
        WHEN "accountId"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Valid UUID'
        WHEN "accountId"::text ~ '^[0-9]+$' THEN 'Integer (as text)'
        ELSE 'Other format'
    END as accountId_format
FROM basic_details
LIMIT 10;

-- Check if accountIds match users.accountId
SELECT 
    bd.id as basic_detail_id,
    bd."accountId" as basic_detail_accountId,
    u.id as user_id,
    u."accountId" as user_accountId,
    CASE 
        WHEN bd."accountId" = u."accountId" THEN 'Match'
        ELSE 'Mismatch'
    END as match_status
FROM basic_details bd
LEFT JOIN users u ON bd."accountId" = u."accountId"
LIMIT 10;

-- Check for any basic_details with accountId that doesn't exist in users
SELECT 
    bd.id,
    bd."accountId",
    'No matching user' as issue
FROM basic_details bd
LEFT JOIN users u ON bd."accountId" = u."accountId"
WHERE u."accountId" IS NULL;

















