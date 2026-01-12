const { Sequelize } = require('sequelize');

// Railway Best Practice: Use DATABASE_URL only
// Railway auto-injects: PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT
// For Railway connections, always use SSL
let sequelize;
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  // Detect if this is a Railway URL (internal or public)
  // All Railway connections should use SSL
  const isRailwayUrl = databaseUrl.includes('railway');
  const requiresSSL = isRailwayUrl || process.env.DB_SSL === 'true';
  
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: requiresSSL ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  // Fall back to individual environment variables
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

const connectDB = async () => {
  try {
    console.log('Attempting to connect to PostgreSQL...');
    const databaseUrl = process.env.DATABASE_URL;
    
    // Check if DATABASE_URL contains unreplaced Railway variable or placeholder (local development issue)
    if (databaseUrl) {
      if (databaseUrl.includes('${RAILWAY_PRIVATE_DOMAIN}')) {
        throw new Error('DATABASE_URL contains unreplaced ${RAILWAY_PRIVATE_DOMAIN}. For local development, use Railway TCP Proxy URL instead.');
      }
      if (databaseUrl.includes('YOUR_RAILWAY_TCP_PROXY_HOST') || databaseUrl.includes('PLACEHOLDER')) {
        throw new Error('DATABASE_URL contains placeholder. Please update with your actual Railway TCP Proxy URL.');
      }
    }
    
    if (databaseUrl) {
      // Mask password in connection string for logging
      const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@');
      console.log('DB Config: Using DATABASE_URL:', maskedUrl);
    } else {
      console.log('DB Config:', {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      });
    }
    
    await sequelize.authenticate();
    console.log('PostgreSQL Connected Successfully');
    
    // Sync models (use { alter: true } for development, remove in production)
    // Note: Disabled alter to avoid SQL syntax errors with unique constraints
    // Run SQL scripts manually to add columns (add-pincode-district-simple.sql)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('Database models synchronized (alter disabled to prevent constraint errors)');
    }
  } catch (error) {
    console.error('Unable to connect to PostgreSQL:');
    console.error('Error Message:', error.message);
    
    // Provide helpful guidance for common connection issues
    if (error.message && (error.message.includes('unreplaced ${RAILWAY_PRIVATE_DOMAIN}') || 
        error.message.includes('placeholder') ||
        (error.message.includes('ENOTFOUND') && (error.message.includes('$') || error.message.includes('${'))))) {
      console.error('\n⚠️  Connection Error: DATABASE_URL not configured for local development');
      console.error('\n${RAILWAY_PRIVATE_DOMAIN} only works when deployed on Railway.');
      console.error('For LOCAL DEVELOPMENT, you need the Railway TCP Proxy URL:');
      console.error('\n📋 Steps to fix:');
      console.error('1. Go to Railway Dashboard > Your PostgreSQL Service');
      console.error('2. Click on "Connect" or "Networking" tab');
      console.error('3. Find "TCP Proxy" connection string');
      console.error('4. In your .env file, uncomment and update DATABASE_URL:');
      console.error('   DATABASE_URL=postgresql://postgres:tzzOfXFykOxoBedVcJTCvnsrQexhgFmR@YOUR_TCP_PROXY_HOST:PORT/railway');
      console.error('\n   Example:');
      console.error('   DATABASE_URL=postgresql://postgres:tzzOfXFykOxoBedVcJTCvnsrQexhgFmR@containers-us-west-xxx.railway.app:6543/railway');
    } else if (!process.env.DATABASE_URL) {
      console.error('\n⚠️  DATABASE_URL is not set in your .env file');
      console.error('Please configure DATABASE_URL for local development (see .env file comments)');
    } else if (error.message && error.message.includes('ENOTFOUND')) {
      console.error('\n⚠️  Connection Error: Cannot resolve hostname');
      console.error('Check your DATABASE_URL in .env file - the hostname may be incorrect');
    }
    
    console.error('\nFull Error:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

