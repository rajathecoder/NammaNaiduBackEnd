require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Connected. Running migration...');

        // Add column if not exists
        await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "profileViewTokens" INTEGER DEFAULT 3 NOT NULL;');

        console.log('Migration successful: "profileViewTokens" column added.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
