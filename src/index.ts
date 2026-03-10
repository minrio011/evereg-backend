import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import campaignRoutes from './modules/campaign/campaign.routes';
import authRoutes from './modules/auth/auth.routes';

const app = express();
const isLocalhost = process.env.DATABASE_URL?.includes("localhost");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalhost ? false : {
    rejectUnauthorized: false,
  },
});
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/campaign', campaignRoutes);
app.use('/api/auth', authRoutes);

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
})

app.listen(PORT, () => {
  console.log(`🚀 Evereg Backend is running on http://localhost:${PORT}`);
});