const { Pool } = require('pg');

// Disable SSL certificate validation for self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Force IPv4 for Railway compatibility
const connectionString = (process.env.DATABASE_URL || '').includes('?')
  ? `${process.env.DATABASE_URL}&family=4`
  : `${process.env.DATABASE_URL}?family=4`;

const pool = new Pool({
  connectionString,
  ssl: true
});

pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

module.exports = pool;
