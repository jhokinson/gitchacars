require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '..', '.env') });

const bcrypt = require('bcrypt');
const pool = require('../pool');

const SALT_ROUNDS = 10;

const testUsers = [
  { email: 'jhokinson@gmail.com', password: 'password123', firstName: 'Jake', lastName: 'Hokinson', role: 'admin', primaryIntent: 'buy' },
  { email: 'buyer1@example.com', password: 'password123', firstName: 'Alice', lastName: 'Buyer', role: 'buyer', primaryIntent: 'buy' },
  { email: 'buyer2@example.com', password: 'password123', firstName: 'Bob', lastName: 'Buyer', role: 'buyer', primaryIntent: 'buy' },
  { email: 'seller1@example.com', password: 'password123', firstName: 'Carol', lastName: 'Seller', role: 'seller', primaryIntent: 'sell' },
  { email: 'seller2@example.com', password: 'password123', firstName: 'Dave', lastName: 'Seller', role: 'seller', primaryIntent: 'sell' },
];

const sampleWantListings = [
  {
    title: 'Looking for a 2020-2024 Honda CR-V under $35k',
    make: 'Honda', model: 'CR-V',
    yearMin: 2020, yearMax: 2024,
    budgetMin: 25000, budgetMax: 35000,
    zipCode: '90210', radiusMiles: 50,
    mileageMax: 50000,
    description: 'Looking for a reliable family SUV with low mileage. Prefer AWD and leather seats.',
    transmission: 'automatic', drivetrain: 'awd', condition: 'used',
  },
  {
    title: 'Want a Toyota Camry 2019-2023',
    make: 'Toyota', model: 'Camry',
    yearMin: 2019, yearMax: 2023,
    budgetMin: 18000, budgetMax: 28000,
    zipCode: '10001', radiusMiles: 100,
    mileageMax: 75000,
    description: 'Need a dependable daily driver sedan. Good fuel economy is important.',
    transmission: 'automatic', drivetrain: 'fwd', condition: 'used',
  },
  {
    title: 'Searching for Ford F-150 2021+',
    make: 'Ford', model: 'F-150',
    yearMin: 2021, yearMax: 2025,
    budgetMin: 35000, budgetMax: 55000,
    zipCode: '75201', radiusMiles: 75,
    mileageMax: 40000,
    description: 'Looking for a full-size truck for work and weekend adventures. Crew cab preferred.',
    transmission: 'automatic', drivetrain: '4wd', condition: 'used',
  },
];

const sampleVehicles = [
  {
    make: 'Honda', model: 'CR-V', year: 2022,
    mileage: 28000, price: 31000,
    zipCode: '90211',
    description: 'Well-maintained 2022 Honda CR-V EX-L with leather interior, sunroof, and AWD. Single owner, all service records available.',
    images: [
      'https://placehold.co/600x400?text=CR-V+Front',
      'https://placehold.co/600x400?text=CR-V+Side',
      'https://placehold.co/600x400?text=CR-V+Interior',
    ],
    transmission: 'automatic', drivetrain: 'awd',
  },
  {
    make: 'Toyota', model: 'Camry', year: 2021,
    mileage: 35000, price: 24000,
    zipCode: '10002',
    description: 'Clean 2021 Toyota Camry SE with excellent fuel economy. Backup camera, Apple CarPlay, and lane assist.',
    images: [
      'https://placehold.co/600x400?text=Camry+Front',
      'https://placehold.co/600x400?text=Camry+Side',
      'https://placehold.co/600x400?text=Camry+Interior',
    ],
    transmission: 'automatic', drivetrain: 'fwd',
  },
];

async function seed() {
  console.log('Seeding test users...');

  const userIds = {};

  for (const u of testUsers) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, primary_intent)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2
       RETURNING id, email, role`,
      [u.email, hash, u.firstName, u.lastName, u.role, u.primaryIntent]
    );
    const user = result.rows[0];
    userIds[u.email] = user.id;
    console.log(`  ${user.role}: ${user.email} (${user.id})`);
  }

  console.log('\nSeeding sample want listings...');

  const buyerEmails = ['buyer1@example.com', 'buyer2@example.com'];
  for (let i = 0; i < sampleWantListings.length; i++) {
    const listing = sampleWantListings[i];
    const buyerEmail = buyerEmails[i % buyerEmails.length];
    const buyerId = userIds[buyerEmail];

    const result = await pool.query(
      `INSERT INTO want_listings (user_id, title, make, model, year_min, year_max, budget_min, budget_max, zip_code, radius_miles, mileage_max, description, transmission, drivetrain, condition)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, title`,
      [buyerId, listing.title, listing.make, listing.model, listing.yearMin, listing.yearMax, listing.budgetMin, listing.budgetMax, listing.zipCode, listing.radiusMiles, listing.mileageMax, listing.description, listing.transmission, listing.drivetrain, listing.condition]
    );
    console.log(`  Listing: ${result.rows[0].title} (${result.rows[0].id})`);
  }

  console.log('\nSeeding sample vehicles...');

  const sellerEmails = ['seller1@example.com', 'seller2@example.com'];
  for (let i = 0; i < sampleVehicles.length; i++) {
    const v = sampleVehicles[i];
    const sellerEmail = sellerEmails[i % sellerEmails.length];
    const sellerId = userIds[sellerEmail];

    const result = await pool.query(
      `INSERT INTO vehicles (user_id, make, model, year, mileage, price, zip_code, description, images, transmission, drivetrain)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, make, model`,
      [sellerId, v.make, v.model, v.year, v.mileage, v.price, v.zipCode, v.description, v.images, v.transmission, v.drivetrain]
    );
    console.log(`  Vehicle: ${result.rows[0].make} ${result.rows[0].model} (${result.rows[0].id})`);
  }

  console.log('\nSeed complete!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
