require('dotenv').config();
const { Sequelize } = require('sequelize');

const testConnection = async () => {
  console.log('\n=== Testing PostgreSQL Connection ===\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST || 'localhost');
  console.log('  Port:', process.env.DB_PORT || 5432);
  console.log('  Database:', process.env.DB_NAME);
  console.log('  User:', process.env.DB_USER);
  console.log('  Password:', process.env.DB_PASSWORD ? '***' : 'NOT SET');
  console.log('\nAttempting connection...\n');

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('\nError Details:');
    console.error('  Code:', error.original?.code || error.code);
    console.error('  Message:', error.message);
    if (error.original) {
      console.error('  Original Error:', error.original.message);
    }
    console.error('\nCommon Solutions:');
    console.error('  1. Check if PostgreSQL service is running');
    console.error('  2. Verify the password in .env matches pgAdmin');
    console.error('  3. Check if the username is correct (usually "postgres")');
    console.error('  4. Verify the database "namanaidu" exists in pgAdmin');
    console.error('  5. Check if PostgreSQL is listening on port 5432');
    process.exit(1);
  }
};

testConnection();

