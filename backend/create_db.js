const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'JOHWEN2019ry@com'
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'org_settings_db'}\`;`);
    console.log('Database checked/created successfully');
    await connection.end();
  } catch (err) {
    console.error('Error creating database:', err);
  }
}
createDb();
