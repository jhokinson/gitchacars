require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });

const fs = require('fs');
const path = require('path');
const pool = require('./pool');

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration file(s)`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');

    console.log(`Running migration: ${file}`);
    try {
      await pool.query(sql);
      console.log(`  Done: ${file}`);
    } catch (err) {
      console.error(`  Error in ${file}:`, err.message);
      throw err;
    }
  }

  console.log('All migrations complete');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
