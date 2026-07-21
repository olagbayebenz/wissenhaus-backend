// Load environment variables (dotenv is no-op in production, vars come from Vercel)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable not set!');
  process.exit(1);
}

module.exports = require('../src/index.js');
