// backend/seed.js
import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: '127.0.0.1',
  user: 'root',
  password: '@sksMysql2005' // 👈 Change to your MySQL password
};

async function seedDB() {
  let connection;
  try {
    // 1. Connect without database to create udyamsetu_db
    connection = await mysql.createConnection(DB_CONFIG);
    await connection.query(`CREATE DATABASE IF NOT EXISTS udyamsetu_db;`);
    await connection.query(`USE udyamsetu_db;`);

    console.log("Database 'udyamsetu_db' ready.");

    // 2. Create Schemes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        scheme_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        categories JSON NOT NULL,
        max_amount DECIMAL(15, 2) NOT NULL,
        min_age INT DEFAULT 18,
        max_age INT DEFAULT 70,
        rate VARCHAR(100),
        indicative_rate DECIMAL(5, 2),
        moratorium VARCHAR(100),
        description TEXT,
        tags JSON,
        business_stages JSON
      );
    `);

    // 3. Create Partners Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS partners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_supported JSON,
        schemes_handled JSON,
        status VARCHAR(100),
        address TEXT,
        latitude DECIMAL(10, 6) NOT NULL,
        longitude DECIMAL(10, 6) NOT NULL
      );
    `);

    // Clear existing data
    await connection.query(`TRUNCATE TABLE schemes;`);
    await connection.query(`TRUNCATE TABLE partners;`);

    // 4. Seed Schemes Data
    const schemes = [
      ['nsf', 'NSFDC Term Loan', JSON.stringify(['sc']), 3000000, 18, 65, '4–6% p.a.', 5.0, 'Up to 6 months', 'Concessional finance for viable income-generating activities by Scheduled Caste entrepreneurs.', JSON.stringify(['SC entrepreneurs', 'New or existing unit']), JSON.stringify(['new', 'existing'])],
      ['nbc', 'NBCFDC General Loan', JSON.stringify(['obc']), 1500000, 18, 60, '5–8% p.a.', 6.5, 'Up to 6 months', 'Financial assistance for self-employment and small enterprise development for eligible OBC beneficiaries.', JSON.stringify(['OBC entrepreneurs', 'Income-linked']), JSON.stringify(['new', 'existing'])],
      ['skf', 'NSKFDC Business Loan', JSON.stringify(['safai']), 1500000, 18, 60, '4–6% p.a.', 5.0, 'Up to 6 months', 'Enterprise support and rehabilitation finance for Safai Karamchari families.', JSON.stringify(['Safai Karamchari', 'Self-employment']), JSON.stringify(['new', 'existing'])],
      ['pmegp', 'PMEGP Margin Money Support', JSON.stringify(['sc', 'obc', 'safai', 'other']), 5000000, 18, 70, 'Bank-linked', 9.0, 'As per lender', 'Credit-linked subsidy support for establishing new micro-enterprises in manufacturing or service sectors.', JSON.stringify(['New enterprises', 'Subsidy support']), JSON.stringify(['new'])]
    ];

    await connection.query(
      `INSERT INTO schemes (scheme_id, name, categories, max_amount, min_age, max_age, rate, indicative_rate, moratorium, description, tags, business_stages) VALUES ?`,
      [schemes]
    );

    // 5. Seed Partners Data
    const partners = [
      ['Maharashtra State Channelising Agency', JSON.stringify(['sc', 'obc']), JSON.stringify(['nsf', 'nbc']), 'Open for enquiries', 'Camp, Pune, Maharashtra 411001', 18.5167, 73.8768],
      ['Nationalised Bank – Camp Branch', JSON.stringify(['sc', 'obc', 'safai', 'other']), JSON.stringify(['pmegp', 'nsf', 'nbc', 'skf']), 'Documents accepted today', 'MG Road, Pune, Maharashtra 411001', 18.5180, 73.8790],
      ['District Industries Centre, Pune', JSON.stringify(['sc', 'obc', 'safai', 'other']), JSON.stringify(['pmegp']), 'Appointment recommended', 'Shivajinagar, Pune, Maharashtra 411005', 18.5314, 73.8520]
    ];

    await connection.query(
      `INSERT INTO partners (name, category_supported, schemes_handled, status, address, latitude, longitude) VALUES ?`,
      [partners]
    );

    console.log('✅ MySQL Database seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding MySQL DB:', err);
  } finally {
    if (connection) await connection.end();
  }
}

seedDB();