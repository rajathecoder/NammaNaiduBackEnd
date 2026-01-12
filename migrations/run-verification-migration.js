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
        AND table_name = 'basic_details'
      );
    `);

    const tableExists = results[0].exists;

    if (!tableExists) {
      console.log('basic_details table does not exist. It will be created with verification fields when the model syncs.');
      process.exit(0);
    }

    // Check if profileverified column exists
    const [profileVerifiedCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'basic_details' 
        AND column_name = 'profileverified'
      );
    `);

    const profileVerifiedExists = profileVerifiedCheck[0].exists;

    // Check if proofverified column exists
    const [proofVerifiedCheck] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'basic_details' 
        AND column_name = 'proofverified'
      );
    `);

    const proofVerifiedExists = proofVerifiedCheck[0].exists;

    if (profileVerifiedExists && proofVerifiedExists) {
      console.log('Verification fields already exist. No migration needed.');
      process.exit(0);
    }

    console.log('Starting migration to add verification fields...');

    // Add profileverified column if it doesn't exist
    if (!profileVerifiedExists) {
      console.log('Step 1: Adding profileverified column...');
      await sequelize.query(`
        ALTER TABLE basic_details 
        ADD COLUMN IF NOT EXISTS profileverified INTEGER DEFAULT 0;
      `);
      console.log('  ✓ profileverified column added');
    } else {
      console.log('  ✓ profileverified column already exists');
    }

    // Add proofverified column if it doesn't exist
    if (!proofVerifiedExists) {
      console.log('Step 2: Adding proofverified column...');
      await sequelize.query(`
        ALTER TABLE basic_details 
        ADD COLUMN IF NOT EXISTS proofverified INTEGER DEFAULT 0;
      `);
      console.log('  ✓ proofverified column added');
    } else {
      console.log('  ✓ proofverified column already exists');
    }

    // Update existing records to have default value 0
    console.log('Step 3: Updating existing records...');
    await sequelize.query(`
      UPDATE basic_details 
      SET profileverified = 0 
      WHERE profileverified IS NULL;
    `);
    await sequelize.query(`
      UPDATE basic_details 
      SET proofverified = 0 
      WHERE proofverified IS NULL;
    `);
    console.log('  ✓ Existing records updated');

    console.log('Migration completed successfully!');
    console.log('profileverified and proofverified columns have been added to basic_details table.');
    
  } catch (error) {
    console.error('Migration failed:', error);
    console.error('\nYou may need to run the SQL migration manually.');
    console.error('See migrations/add_verification_fields_to_basic_details.sql for instructions.');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

runMigration();
