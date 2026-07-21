const { Pool } = require('pg');

// Force IPv4 and SSL for Supabase compatibility
const connectionString = (process.env.DATABASE_URL || '').includes('?')
  ? `${process.env.DATABASE_URL}&sslmode=require&family=4`
  : `${process.env.DATABASE_URL}?sslmode=require&family=4`;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;
