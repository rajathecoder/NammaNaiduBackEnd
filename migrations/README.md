# Database Migrations

## Migration: Change personId from INTEGER to UUID

The `person_photos` table needs to be updated to use UUID for `personId` instead of INTEGER.

### Option 1: Fresh Start (Delete all existing data)

If you don't have important data in the `person_photos` table, use this script:

```bash
psql -U your_username -d your_database -f alter_person_photos_personid_to_uuid.sql
```

Or run the SQL directly in your PostgreSQL client.

### Option 2: Preserve Existing Data

If you have existing photo data that you want to keep, use this script which maps existing user IDs to accountIds:

```bash
psql -U your_username -d your_database -f alter_person_photos_personid_to_uuid_preserve_data.sql
```

### Manual Steps (if scripts don't work)

1. Connect to your PostgreSQL database
2. Run the SQL commands from one of the migration files
3. Verify the column type: `\d person_photos` in psql

### After Migration

Restart your backend server. The model is already configured to use UUID, so it should work correctly after the migration.
