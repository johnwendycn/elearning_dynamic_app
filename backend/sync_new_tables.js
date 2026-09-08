require('dotenv').config();
const { sequelize, ContactMessage, EventRegistration } = require('./src/models');

async function syncNewTables() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected.');

    console.log('Syncing ContactMessage table...');
    await ContactMessage.sync({ alter: true });
    console.log('✓ contact_messages table ready.');

    console.log('Syncing EventRegistration table...');
    await EventRegistration.sync({ alter: true });
    console.log('✓ event_registrations table ready.');

    console.log('\n✅ All new tables synced successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

syncNewTables();
