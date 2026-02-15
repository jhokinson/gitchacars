require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '..', '.env') });

const fs = require('fs');
const path = require('path');
const pool = require('../pool');

async function seedZipCodes() {
  const csvPath = path.join(__dirname, '..', 'data', 'us_zip_codes.csv');

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.trim().split('\n');

  // Skip header row (ZIP,LAT,LNG)
  const dataLines = lines.slice(1);

  console.log(`Found ${dataLines.length} zip codes to insert`);

  const BATCH_SIZE = 500;
  let inserted = 0;

  for (let i = 0; i < dataLines.length; i += BATCH_SIZE) {
    const batch = dataLines.slice(i, i + BATCH_SIZE);
    const values = [];
    const params = [];
    let paramIdx = 1;

    for (const line of batch) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 3) continue;

      const [zip, lat, lng] = parts;
      if (!zip || !lat || !lng) continue;

      values.push(`($${paramIdx}, $${paramIdx + 1}, $${paramIdx + 2})`);
      params.push(zip, parseFloat(lat), parseFloat(lng));
      paramIdx += 3;
    }

    if (values.length === 0) continue;

    await pool.query(
      `INSERT INTO zip_codes (zip, latitude, longitude)
       VALUES ${values.join(', ')}
       ON CONFLICT (zip) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude`,
      params
    );

    inserted += values.length;
    if (inserted % 5000 === 0 || i + BATCH_SIZE >= dataLines.length) {
      console.log(`  Inserted ${inserted} / ${dataLines.length} zip codes`);
    }
  }

  console.log(`\nZip code seeding complete: ${inserted} records`);
}

seedZipCodes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Zip code seeding failed:', err.message);
    process.exit(1);
  });
