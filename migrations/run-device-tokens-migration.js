const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') || process.env.DATABASE_URL?.includes('render') 
    ? { rejectUnauthorized: false } 
    : false,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting device_tokens table migration...');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'create_device_tokens_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Check if table already exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'device_tokens'
      );
    `;
    const tableExists = await client.query(checkTableQuery);
    
    if (tableExists.rows[0].exists) {
      console.log('Table device_tokens already exists. Skipping migration.');
      return;
    }

    // Execute migration
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');

    console.log('✅ Device tokens table migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error running device tokens migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('Migration script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

