require('dotenv').config();
const { sequelize } = require('../src/config/database');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Check if table exists
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'person_photos'
      );
    `);

    const tableExists = results[0].exists;

    if (!tableExists) {
      console.log('person_photos table does not exist. It will be created with UUID type when the model syncs.');
      process.exit(0);
    }

    // Check current column type
    const [columnInfo] = await sequelize.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'person_photos' 
      AND column_name = 'personId';
    `);

    if (columnInfo.length === 0) {
      console.log('personId column does not exist. Table will be created with correct type.');
      process.exit(0);
    }

    const currentType = columnInfo[0].data_type;

    if (currentType === 'uuid') {
      console.log('personId column is already UUID. No migration needed.');
      process.exit(0);
    }

    console.log(`Current personId type: ${currentType}`);
    console.log('Starting migration to UUID...');

    // Step 1: Find and drop ALL foreign key constraints on personId
    console.log('Step 1: Finding and dropping all foreign key constraints...');
    const [constraints] = await sequelize.query(`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'person_photos'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%personId%';
    `);

    for (const constraint of constraints) {
      const constraintName = constraint.constraint_name;
      console.log(`  Dropping constraint: ${constraintName}`);
      await sequelize.query(`
        ALTER TABLE person_photos 
        DROP CONSTRAINT IF EXISTS "${constraintName}" CASCADE;
      `);
    }

    // Also try common constraint names
    await sequelize.query(`
      ALTER TABLE person_photos 
      DROP CONSTRAINT IF EXISTS person_photos_personId_fkey CASCADE;
    `);
    await sequelize.query(`
      ALTER TABLE person_photos 
      DROP CONSTRAINT IF EXISTS person_photos_personid_fkey CASCADE;
    `);

    console.log('Step 2: Dropping unique index...');
    await sequelize.query(`
      DROP INDEX IF EXISTS person_photos_personId_unique;
    `);
    await sequelize.query(`
      DROP INDEX IF EXISTS person_photos_personid_unique;
    `);

    console.log('Step 3: Truncating table (deleting all existing data)...');
    await sequelize.query(`TRUNCATE TABLE person_photos;`);

    console.log('Step 4: Changing column type to UUID...');
    await sequelize.query(`
      ALTER TABLE person_photos 
      ALTER COLUMN "personId" TYPE UUID USING NULL;
    `);

    console.log('Step 5: Setting column to NOT NULL...');
    await sequelize.query(`
      ALTER TABLE person_photos 
      ALTER COLUMN "personId" SET NOT NULL;
    `);

    console.log('Step 6: Recreating foreign key constraint...');
    await sequelize.query(`
      ALTER TABLE person_photos 
      ADD CONSTRAINT person_photos_personId_fkey 
      FOREIGN KEY ("personId") 
      REFERENCES users("accountId") 
      ON DELETE CASCADE;
    `);

    console.log('Step 7: Recreating unique index...');
    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS person_photos_personId_unique 
      ON person_photos("personId");
    `);
    
    console.log('Migration completed successfully!');
    console.log('personId column has been changed from INTEGER to UUID.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('\nYou may need to run the SQL migration manually.');
    console.error('See migrations/README.md for instructions.');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

runMigration();
