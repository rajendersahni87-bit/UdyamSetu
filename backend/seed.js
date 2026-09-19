// backend/seed.js
import mysql from 'mysql2/promise';

const PORT = process.env.PORT || 8000;

// 1. Define DB_CONFIG with SSL support for Aiven Cloud (falls back to local)
const DB_CONFIG = {
  host: process.env.DB_HOST || 'mysql-2ba7f8d0-rajendersahni87-d29c.c.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 21559,
  ssl: {
    rejectUnauthorized: false
  }
};

const DB_NAME = process.env.DB_NAME || 'defaultdb';

// 2. Pool configuration for running queries inside the database
const pool = mysql.createPool({
  ...DB_CONFIG,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

async function seedDB() {
  let connection;
  try {
    // 1. Connect to cloud instance
    connection = await mysql.createConnection(DB_CONFIG);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.query(`USE \`${DB_NAME}\`;`);

    console.log(`Connected & using database: ${DB_NAME}`);

    // Create Schemes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scheme_id VARCHAR(50) UNIQUE,
        name VARCHAR(255),
        category VARCHAR(50),
        max_amount DECIMAL(12,2),
        interest_rate VARCHAR(50),
        moratorium VARCHAR(50),
        description TEXT,
        tags JSON
      );
    `);

    // Create Partners Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        scheme_id VARCHAR(50),
        latitude DECIMAL(10,6),
        longitude DECIMAL(10,6),
        distance_km DECIMAL(5,2),
        status VARCHAR(100)
      );
    `);

    // Insert Sample Schemes
    await connection.query(`
      INSERT IGNORE INTO schemes (scheme_id, name, category, max_amount, interest_rate, moratorium, description, tags) VALUES 
      ('nsf', 'NSFDC Term Loan', 'sc', 3000000, '4–6% p.a.', 'Up to 6 months', 'Concessional finance for viable income-generating activities by Scheduled Caste entrepreneurs.', JSON_ARRAY('SC entrepreneurs', 'New or existing unit')),
      ('nbc', 'NBCFDC General Loan', 'obc', 1500000, '5–8% p.a.', 'Up to 6 months', 'Financial assistance for self-employment and small enterprise development for eligible OBC beneficiaries.', JSON_ARRAY('OBC entrepreneurs', 'Income-linked')),
      ('pmegp', 'PMEGP Margin Money Support', 'other', 5000000, 'Bank-linked', 'As per lender', 'Credit-linked subsidy support for establishing new micro-enterprises in manufacturing or service sectors.', JSON_ARRAY('New enterprises', 'Subsidy support'));
    `);

    // Insert Sample Partners
    await connection.query(`
      INSERT IGNORE INTO partners (name, scheme_id, latitude, longitude, distance_km, status) VALUES 
      ('Maharashtra State Channelising Agency', 'nsf', 18.5167, 73.8768, 1.80, 'Authorised · Open'),
      ('Nationalised Bank – Camp Branch', 'pmegp', 18.5180, 73.8790, 2.40, 'Documents accepted today'),
      ('District Industries Centre, Pune', 'nbc', 18.5314, 73.8520, 4.10, 'Appointment recommended');
    `);

    console.log("Database tables and seed data populated successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    if (connection) await connection.end();
  }
}

seedDB();