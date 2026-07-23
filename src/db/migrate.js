require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./connection');

async function migrate() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('🚀 Running database migrations...');

    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const statement of statements) {
      await pool.query(statement);
    }

    console.log('✅ Database migrations completed successfully');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    await pool.end();
    process.exit(1);
  }
}

migrate();
