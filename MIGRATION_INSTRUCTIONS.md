# Database Migration Instructions

## Problem
You're getting this error:
```
Database column error: column "userId" does not exist
```

This happens because the code has been updated to use `accountId` (UUID) instead of `userId` (INTEGER), but the database hasn't been migrated yet.

## Solution: Run the Migration Script

### Step 1: Connect to Your Database
Open your PostgreSQL client (pgAdmin, DBeaver, psql, etc.) and connect to your database.

### Step 2: Check Current State (Optional)
Run this to see what columns currently exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'basic_details';
```

### Step 3: Run the Migration
Execute the SQL script: `migrate-basic-details-simple.sql`

You can either:
- Copy and paste the entire script into your SQL client
- Or run it via command line:
  ```bash
  psql -U your_username -d your_database -f migrate-basic-details-simple.sql
  ```

### Step 4: Verify Migration
After running the migration, verify it worked:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'basic_details';
```

You should see `accountId` (UUID) and NOT see `userId` (INTEGER).

### Step 5: Restart Your Backend Server
After the migration is complete, restart your Node.js backend server.

### Step 6: Test
Try submitting the form at `http://localhost:5173/additional-details` again.

## What the Migration Does

1. Adds `accountId` column (UUID) to `basic_details` table
2. Copies data from `users.accountId` to `basic_details.accountId` (matching by user id)
3. Drops the old `userId` column
4. Adds constraints (NOT NULL, UNIQUE, FOREIGN KEY)
5. Creates an index for better performance

## Troubleshooting

### If migration fails with "column already exists"
- The `accountId` column might already exist. Check with the diagnostic query above.
- You may need to manually drop it first: `ALTER TABLE basic_details DROP COLUMN IF EXISTS "accountId";`

### If migration fails with "foreign key constraint"
- There might be existing foreign key constraints. The script should handle this, but if it doesn't, manually drop them first.

### If you have no data in basic_details
- The migration will still work - it will just create the new column structure.

## Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Verify your database connection
3. Make sure you have the correct permissions to alter tables
4. Check if the `users` table has the `accountId` column (it should)

