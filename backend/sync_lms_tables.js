const { sequelize } = require('./src/models');

async function syncLms() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully! LMS tables (enrollments, unit_progresses, certificates) created or updated.');
  } catch (err) {
    console.error('Error syncing LMS tables:', err);
  } finally {
    process.exit(0);
  }
}

syncLms();
