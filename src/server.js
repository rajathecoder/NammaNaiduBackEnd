require('dotenv').config();

// Import models to ensure they are registered with Sequelize
require('./models/User.model');
require('./models/Otp.model');
require('./models/BasicDetail.model');
require('./models/Admin.model');
require('./models/masters');
require('./models/SubscriptionPlan.model');
require('./models/SubscriptionTransaction.model');
require('./models/ProfileAction.model');
require('./models/PersonPhoto.model');
require('./models/Notification.model');
require('./models/DeviceToken.model');

const app = require('./app');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use!`);
      console.error(`\nTo fix this, you can:`);
      console.error(`1. Kill the process using port ${PORT}:`);
      console.error(`   Windows: netstat -ano | findstr :${PORT}`);
      console.error(`   Then: taskkill /PID <PID> /F`);
      console.error(`\n2. Or use a different port by setting PORT in your .env file`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
};

startServer();


