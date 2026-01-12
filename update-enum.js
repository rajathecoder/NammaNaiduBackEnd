require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function updateEnum() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        try {
            await sequelize.query(`ALTER TYPE "enum_profile_actions_actionType" ADD VALUE 'accept';`);
            console.log('Successfully added "accept" to enum_profile_actions_actionType');
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log('"accept" already exists in enum');
            } else {
                console.error('Error adding value to enum (might be non-fatal if using different enum name):', e.message);
                // Try to list enums to see what the name is
                const enums = await sequelize.query(`
          SELECT t.typname
          FROM pg_type t 
          JOIN pg_enum e ON t.oid = e.enumtypid  
          GROUP BY t.typname;
        `);
                console.log('Available enums:', JSON.stringify(enums[0], null, 2));
            }
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await sequelize.close();
    }
}

updateEnum();
