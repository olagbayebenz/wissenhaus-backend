require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./connection');

async function migrate() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

    console.log('🚀 Running database migrations...');

    // Split statements by semicolon and execute individually
    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const statement of statements) {
      await db.run(statement);
    }

    console.log('✅ Database migrations completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
