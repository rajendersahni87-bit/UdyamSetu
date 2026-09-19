import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
// 1. Initialize Express FIRST
const app = express();
const PORT = 8000;

// 2. Setup path helpers for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Middleware setup
app.use(cors());
app.use(express.json());

// 4. Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// 5. Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MySQL Connection Pool


// 1. Base config using environment variables (used for initial connection)
const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '@sksMysql2005',
  port: process.env.DB_PORT || 3306
};

const DB_NAME = process.env.DB_NAME || 'udyamsetu_db';

// 2. Pool config for querying the specific database
const pool = mysql.createPool({
  ...DB_CONFIG,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Leave the rest of your seed.js functions below this...

// Utility: Calculate EMI
function calculateEMI(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// 1. Match Schemes Endpoint
app.post('/api/match', async (req, res) => {
  try {
    const { category, age, business, stage, amount } = req.body;

    const [rows] = await pool.query('SELECT * FROM schemes');

    let matchedSchemes = rows.filter(s => {
      const categories = typeof s.categories === 'string' ? JSON.parse(s.categories) : s.categories;
      return categories.includes(category) &&
             Number(amount) <= Number(s.max_amount) &&
             Number(age) >= s.min_age &&
             Number(age) <= s.max_age;
    });

    if (!matchedSchemes.length) {
      matchedSchemes = rows.filter(s => s.scheme_id === 'pmegp');
    }

    const matches = matchedSchemes.map(s => {
      let score = 85;
      const categories = typeof s.categories === 'string' ? JSON.parse(s.categories) : s.categories;
      const stages = typeof s.business_stages === 'string' ? JSON.parse(s.business_stages) : s.business_stages;

      if (categories.includes(category) && category !== 'other') score += 10;
      if (stages && stages.includes(stage)) score += 3;
      score = Math.min(score, 98);

      const estimatedEmi = Math.round(calculateEMI(Number(amount), Number(s.indicative_rate) || 8.0, 60));

      return {
        scheme: {
          ...s,
          categories: typeof s.categories === 'string' ? JSON.parse(s.categories) : s.categories,
          tags: typeof s.tags === 'string' ? JSON.parse(s.tags) : s.tags,
          business_stages: stages
        },
        match_score: score,
        estimated_emi_5yr: estimatedEmi,
        fit_reason: `Matches target profile for required capital of ₹${Number(amount).toLocaleString('en-IN')}.`
      };
    }).sort((a, b) => b.match_score - a.match_score);

    res.json({ status: 'success', count: matches.length, matches });
  } catch (err) {
    console.error("Match Error:", err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Geo-Spatial Partner Locator
app.get('/api/partners/nearby', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 18.5204;
    const userLng = parseFloat(req.query.lng) || 73.8567;

    const [rows] = await pool.query(`
      SELECT *,
        ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) 
        * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) 
        * sin( radians( latitude ) ) ) ) AS distance_km
      FROM partners
      HAVING distance_km < 50
      ORDER BY distance_km ASC
      LIMIT 10;
    `, [userLat, userLng, userLat]);

    const formatted = rows.map(p => ({
      ...p,
      category_supported: typeof p.category_supported === 'string' ? JSON.parse(p.category_supported) : p.category_supported,
      schemes_handled: typeof p.schemes_handled === 'string' ? JSON.parse(p.schemes_handled) : p.schemes_handled,
      distance_km: Math.round(p.distance_km * 10) / 10
    }));

    res.json({ status: 'success', partners: formatted });
  } catch (err) {
    console.error("Partners Error:", err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MySQL-backed Node.js server running at http://localhost:${PORT}`);
});