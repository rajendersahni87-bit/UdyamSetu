import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 8000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MySQL Cloud Connection Pool with SSL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql-2ba7f8d0-rajendersahni87-d29c.c.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_CAq-P3zHbLVvWBkZ40o',
  database: process.env.DB_NAME || 'defaultdb',
  port: process.env.DB_PORT || 21559,
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10
});

// API Routes
app.post('/api/match', async (req, res) => {
  try {
    const { category, amount } = req.body;
    const [rows] = await pool.query('SELECT * FROM schemes WHERE max_amount >= ?', [amount || 0]);
    
    const matches = rows.map(scheme => ({
      match_score: 95,
      scheme: scheme
    }));

    res.json({ status: 'success', matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Geo-Spatial Distance Route using Haversine formula in SQL
app.get('/api/partners/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const userLat = parseFloat(lat) || 18.5204;
    const userLng = parseFloat(lng) || 73.8567;

    const query = `
      SELECT *, 
      (6371 * ACOS(COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) + SIN(RADIANS(?)) * SIN(RADIANS(latitude)))) AS distance_km
      FROM partners
      HAVING distance_km < 50
      ORDER BY distance_km ASC
      LIMIT 5;
    `;

    const [partners] = await pool.query(query, [userLat, userLng, userLat]);
    res.json({ status: 'success', partners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`UdyamSetu server running on port ${PORT}`);
});