const app = require('./app');
const { sequelize } = require('./models');
const { syncAppModules } = require('./utils/moduleSync');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Test DB Connection and Sync
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Use standard sync to avoid creating duplicate index constraints
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database models synchronized successfully.');
    }

    // Automatically synchronize all application modules into the database
    await syncAppModules();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Local:   http://localhost:${PORT}`);
      console.log(`Network: http://10.252.40.78:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
}

startServer();
