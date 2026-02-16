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
  { email: 'marcus.chen@example.com', password: 'password123', firstName: 'Marcus', lastName: 'Chen', role: 'buyer', primaryIntent: 'buy' },
  { email: 'sarah.mitchell@example.com', password: 'password123', firstName: 'Sarah', lastName: 'Mitchell', role: 'buyer', primaryIntent: 'buy' },
  { email: 'james.rodriguez@example.com', password: 'password123', firstName: 'James', lastName: 'Rodriguez', role: 'buyer', primaryIntent: 'buy' },
  { email: 'emily.watson@example.com', password: 'password123', firstName: 'Emily', lastName: 'Watson', role: 'buyer', primaryIntent: 'buy' },
  { email: 'david.kim@example.com', password: 'password123', firstName: 'David', lastName: 'Kim', role: 'seller', primaryIntent: 'sell' },
  { email: 'rachel.green@example.com', password: 'password123', firstName: 'Rachel', lastName: 'Green', role: 'seller', primaryIntent: 'sell' },
];

const listingAssignments = [
  // Original 3 listings
  {
    buyer: 'buyer1@example.com',
    listing: {
      title: 'Looking for a 2020-2024 Honda CR-V under $35k',
      make: 'Honda', model: 'CR-V',
      yearMin: 2020, yearMax: 2024,
      budgetMin: 25000, budgetMax: 35000,
      zipCode: '90210', radiusMiles: 50,
      mileageMax: 50000,
      description: 'Looking for a reliable family SUV with low mileage. Prefer AWD and leather seats. Must have clean title and full service history — I want something my family can depend on for years.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  {
    buyer: 'buyer2@example.com',
    listing: {
      title: 'Want a Toyota Camry 2019-2023',
      make: 'Toyota', model: 'Camry',
      yearMin: 2019, yearMax: 2023,
      budgetMin: 18000, budgetMax: 28000,
      zipCode: '10001', radiusMiles: 100,
      mileageMax: 75000,
      description: 'Need a dependable daily driver sedan with great fuel economy. Apple CarPlay and safety features are must-haves. Ideally the SE or XSE trim with the sport suspension.',
      transmission: 'automatic', drivetrain: 'fwd', condition: 'used',
    },
  },
  {
    buyer: 'buyer1@example.com',
    listing: {
      title: 'Searching for Ford F-150 2021+',
      make: 'Ford', model: 'F-150',
      yearMin: 2021, yearMax: 2025,
      budgetMin: 35000, budgetMax: 55000,
      zipCode: '78701', radiusMiles: 75,
      mileageMax: 40000,
      description: 'Looking for a full-size truck for work and weekend adventures. Crew cab preferred with the 3.5L EcoBoost. Tow package is a must — I pull a 24-foot boat on weekends.',
      transmission: 'automatic', drivetrain: '4wd', condition: 'used',
    },
  },
  // Classic cars
  {
    buyer: 'sarah.mitchell@example.com',
    listing: {
      title: '1965-1968 Ford Mustang Fastback — Dream Garage Build',
      make: 'Ford', model: 'Mustang',
      yearMin: 1965, yearMax: 1968,
      budgetMin: 40000, budgetMax: 75000,
      zipCode: '90210', radiusMiles: 200,
      mileageMax: 999999,
      description: 'Searching for a first-gen Mustang fastback to complete my dream garage. S-code or K-code preferred but I am open to a clean 289 car with solid floors and frame rails. Matching numbers would be incredible but not required — this is going to be a restomod with modern EFI and Wilwood brakes.',
      transmission: 'manual', drivetrain: 'rwd', condition: 'used',
    },
  },
  {
    buyer: 'sarah.mitchell@example.com',
    listing: {
      title: '1969-1972 Chevrolet Chevelle SS — Big Block Wanted',
      make: 'Chevrolet', model: 'Chevelle',
      yearMin: 1969, yearMax: 1972,
      budgetMin: 45000, budgetMax: 90000,
      zipCode: '60601', radiusMiles: 300,
      mileageMax: 999999,
      description: 'In the market for an A-body Chevelle SS with a big block — 396 or 454. Factory 4-speed cars get priority but I will absolutely consider an automatic with a clean body. Cranberry Red, Fathom Blue, or Forest Green are the colors that make me weak. Partial projects considered if the body is straight and rust-free.',
      transmission: null, drivetrain: 'rwd', condition: 'used',
    },
  },
  // Exotic cars
  {
    buyer: 'james.rodriguez@example.com',
    listing: {
      title: 'Ferrari 488 GTB — 2016-2019 Low Miles',
      make: 'Ferrari', model: '488 GTB',
      yearMin: 2016, yearMax: 2019,
      budgetMin: 200000, budgetMax: 280000,
      zipCode: '33101', radiusMiles: 500,
      mileageMax: 15000,
      description: 'Ready to pull the trigger on a 488 GTB. Rosso Corsa or Grigio Silverstone exterior with tan or nero interior. Must have carbon fiber racing seats, front lift system, and JBL premium audio. Full Ferrari dealer service history only — no independent shop cars. Will fly anywhere in the US for the right example.',
      transmission: 'automatic', drivetrain: 'rwd', condition: 'used',
    },
  },
  {
    buyer: 'james.rodriguez@example.com',
    listing: {
      title: 'Porsche 911 Turbo S (992) — 2021-2024',
      make: 'Porsche', model: '911',
      yearMin: 2021, yearMax: 2024,
      budgetMin: 170000, budgetMax: 220000,
      zipCode: '33101', radiusMiles: 500,
      mileageMax: 20000,
      description: 'Looking for the ultimate 992 Turbo S. Coupe only — no cabriolet. Must have Sport Chrono, PCCB ceramic brakes, and rear-axle steering. GT Silver, Chalk, or Guards Red preferred. Lightweight package is the holy grail but I know those are unicorns. No track cars or PDK issues.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  {
    buyer: 'james.rodriguez@example.com',
    listing: {
      title: 'Lamborghini Huracán EVO — Head-Turner Wanted',
      make: 'Lamborghini', model: 'Huracán',
      yearMin: 2019, yearMax: 2024,
      budgetMin: 200000, budgetMax: 300000,
      zipCode: '33101', radiusMiles: 500,
      mileageMax: 12000,
      description: 'Want a Huracán EVO or EVO Spyder that turns heads even in Miami. Verde Mantis, Arancio Borealis, or Blu Cepheus — I want a color that stops traffic. Full Ad Personam spec preferred. Forged composite engine bay and transparent bonnet are on my wish list. Lifter system required for daily driving over speed bumps.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  // Luxury SUVs
  {
    buyer: 'emily.watson@example.com',
    listing: {
      title: 'Range Rover Sport HSE or Autobiography 2021+',
      make: 'Land Rover', model: 'Range Rover Sport',
      yearMin: 2021, yearMax: 2025,
      budgetMin: 55000, budgetMax: 85000,
      zipCode: '80202', radiusMiles: 150,
      mileageMax: 35000,
      description: 'Looking for a Range Rover Sport that can handle Colorado winters and still look stunning at the valet. HSE or Autobiography trim with the panoramic roof, Meridian audio, and air suspension. Santorini Black or Eiger Grey exterior. Must have a clean Carfax — these are too expensive to gamble on.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  {
    buyer: 'marcus.chen@example.com',
    listing: {
      title: 'BMW X5 M Competition — The Ultimate Family Rocket',
      make: 'BMW', model: 'X5 M',
      yearMin: 2020, yearMax: 2024,
      budgetMin: 70000, budgetMax: 105000,
      zipCode: '98101', radiusMiles: 200,
      mileageMax: 30000,
      description: 'Need a family SUV that can embarrass sports cars at stoplights. The X5 M Competition with the 617hp twin-turbo V8 is the perfect wolf in sheep clothing. Must have carbon fiber trim, M sport exhaust, and the individual Merino leather. Toronto Red or Marina Bay Blue are my top picks.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  // Daily / Budget
  {
    buyer: 'emily.watson@example.com',
    listing: {
      title: 'Honda Accord under $15k — Reliable Commuter',
      make: 'Honda', model: 'Accord',
      yearMin: 2017, yearMax: 2021,
      budgetMin: 8000, budgetMax: 15000,
      zipCode: '80202', radiusMiles: 100,
      mileageMax: 90000,
      description: 'Simple ask — I need a bulletproof commuter car that sips gas and never leaves me stranded. The 10th-gen Accord with the 1.5T is perfect. Sport or EX-L trim preferred. Must have clean title and no accident history. Willing to drive to pick it up if the price is right.',
      transmission: 'automatic', drivetrain: 'fwd', condition: 'used',
    },
  },
  {
    buyer: 'marcus.chen@example.com',
    listing: {
      title: 'Mazda CX-5 under $25k — Fun Daily Driver',
      make: 'Mazda', model: 'CX-5',
      yearMin: 2019, yearMax: 2024,
      budgetMin: 18000, budgetMax: 25000,
      zipCode: '98101', radiusMiles: 100,
      mileageMax: 50000,
      description: 'The CX-5 drives like a sports car disguised as a crossover and that is exactly what I want. Grand Touring or Signature trim with the turbo 2.5L engine. Soul Red Crystal is the only color that does this car justice. Bose audio and heads-up display are must-haves for me.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  // EVs
  {
    buyer: 'marcus.chen@example.com',
    listing: {
      title: 'Tesla Model Y Long Range — 2022-2024',
      make: 'Tesla', model: 'Model Y',
      yearMin: 2022, yearMax: 2024,
      budgetMin: 35000, budgetMax: 48000,
      zipCode: '98101', radiusMiles: 150,
      mileageMax: 30000,
      description: 'Ready to go electric and the Model Y Long Range is the sweet spot of range, space, and tech. Must have FSD capability and the white interior. Prefer the updated Highland refresh if I can find one in budget. No salvage titles or battery degradation issues — I want at least 90% battery health.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  {
    buyer: 'marcus.chen@example.com',
    listing: {
      title: 'Rivian R1S — Adventure-Ready Electric SUV',
      make: 'Rivian', model: 'R1S',
      yearMin: 2022, yearMax: 2025,
      budgetMin: 60000, budgetMax: 85000,
      zipCode: '98101', radiusMiles: 300,
      mileageMax: 25000,
      description: 'The R1S is the ultimate adventure vehicle and I am tired of waiting for a new order. Looking for a lightly used example with the Large battery pack and quad motor setup. Forest Green or Launch Green exterior. Must have the Camp Kitchen and all-terrain tires. This thing needs to handle Washington trails and Seattle commutes equally.',
      transmission: 'automatic', drivetrain: 'awd', condition: 'used',
    },
  },
  // Project car
  {
    buyer: 'james.rodriguez@example.com',
    listing: {
      title: 'Nissan 240SX S13 or S14 — Drift Build Platform',
      make: 'Nissan', model: '240SX',
      yearMin: 1989, yearMax: 1998,
      budgetMin: 8000, budgetMax: 25000,
      zipCode: '33101', radiusMiles: 500,
      mileageMax: 999999,
      description: 'Building a dedicated drift car and the 240SX is the only chassis that makes sense. S13 coupe or S14 kouki preferred. KA24DE or SR20DET swapped — does not matter since I am dropping in an LS3 anyway. Clean shell with no major rust is all I need. Roll cage already welded is a bonus. Sunroof delete cars get priority.',
      transmission: 'manual', drivetrain: 'rwd', condition: 'used',
    },
  },
];

const vehicleAssignments = [
  // Original 2 vehicles
  {
    seller: 'seller1@example.com',
    vehicle: {
      make: 'Honda', model: 'CR-V', year: 2022,
      mileage: 28000, price: 31000,
      zipCode: '90211',
      description: 'Well-maintained 2022 Honda CR-V EX-L with leather interior, sunroof, and AWD. Single owner, all service records available. Garage kept since new with ceramic coating applied at delivery.',
      images: [
        'https://placehold.co/600x400?text=CR-V+Front',
        'https://placehold.co/600x400?text=CR-V+Side',
        'https://placehold.co/600x400?text=CR-V+Interior',
      ],
      transmission: 'automatic', drivetrain: 'awd',
    },
  },
  {
    seller: 'seller2@example.com',
    vehicle: {
      make: 'Toyota', model: 'Camry', year: 2021,
      mileage: 35000, price: 24000,
      zipCode: '10002',
      description: 'Clean 2021 Toyota Camry SE with excellent fuel economy. Backup camera, Apple CarPlay, lane assist, and adaptive cruise control. Midnight Black Metallic paint in excellent condition.',
      images: [
        'https://placehold.co/600x400?text=Camry+Front',
        'https://placehold.co/600x400?text=Camry+Side',
        'https://placehold.co/600x400?text=Camry+Interior',
      ],
      transmission: 'automatic', drivetrain: 'fwd',
    },
  },
  {
    seller: 'david.kim@example.com',
    vehicle: {
      make: 'Ferrari', model: '488 GTB', year: 2019,
      mileage: 8500, price: 245000,
      zipCode: '33101',
      description: 'Stunning 2019 Ferrari 488 GTB in Rosso Corsa over Crema leather. Full carbon fiber racing package with Daytona-style seats, carbon steering wheel, and carbon door sills. Front lift system, parking cameras, and JBL premium audio. Every service performed at authorized Ferrari dealer — complete records binder included.',
      images: [
        'https://placehold.co/600x400?text=Ferrari+488+Front',
        'https://placehold.co/600x400?text=Ferrari+488+Side',
        'https://placehold.co/600x400?text=Ferrari+488+Engine',
      ],
      transmission: 'automatic', drivetrain: 'rwd',
    },
  },
  {
    seller: 'david.kim@example.com',
    vehicle: {
      make: 'Porsche', model: '911 Turbo S', year: 2021,
      mileage: 12000, price: 189000,
      zipCode: '33101',
      description: 'Immaculate 992 Porsche 911 Turbo S in GT Silver Metallic with Bordeaux Red leather. Sport Chrono, PCCB ceramic brakes, rear-axle steering, sport exhaust, and Burmester audio. Two keys, original window sticker, and full Porsche dealer service history. Never tracked, never launched, always garaged.',
      images: [
        'https://placehold.co/600x400?text=911+Turbo+S+Front',
        'https://placehold.co/600x400?text=911+Turbo+S+Rear',
        'https://placehold.co/600x400?text=911+Turbo+S+Interior',
      ],
      transmission: 'automatic', drivetrain: 'awd',
    },
  },
  {
    seller: 'rachel.green@example.com',
    vehicle: {
      make: 'Ford', model: 'Mustang', year: 1968,
      mileage: 78000, price: 55000,
      zipCode: '78701',
      description: 'Numbers-matching 1968 Ford Mustang Fastback with the J-code 302 V8 and C4 automatic. Highland Green just like Bullitt. Solid floors, clean frame rails, and zero rust. Interior is original deluxe with the woodgrain dash. Runs and drives beautifully — starts every time. This is a true survivor, not a restoration.',
      images: [
        'https://placehold.co/600x400?text=68+Mustang+Front',
        'https://placehold.co/600x400?text=68+Mustang+Side',
        'https://placehold.co/600x400?text=68+Mustang+Engine',
      ],
      transmission: 'automatic', drivetrain: 'rwd',
    },
  },
  {
    seller: 'rachel.green@example.com',
    vehicle: {
      make: 'Tesla', model: 'Model Y', year: 2023,
      mileage: 15000, price: 42000,
      zipCode: '98101',
      description: 'Like-new 2023 Tesla Model Y Long Range AWD in Pearl White with white vegan leather interior. Full Self-Driving capability, 20-inch induction wheels, tow hitch, and all-weather floor mats. Battery health at 97%. Software version is current. Supercharger network access included of course.',
      images: [
        'https://placehold.co/600x400?text=Model+Y+Front',
        'https://placehold.co/600x400?text=Model+Y+Side',
        'https://placehold.co/600x400?text=Model+Y+Interior',
      ],
      transmission: 'automatic', drivetrain: 'awd',
    },
  },
  {
    seller: 'david.kim@example.com',
    vehicle: {
      make: 'Land Rover', model: 'Range Rover Sport', year: 2022,
      mileage: 22000, price: 68000,
      zipCode: '80202',
      description: 'Luxurious 2022 Range Rover Sport HSE in Santorini Black with Ebony Windsor leather. Panoramic roof, Meridian surround sound, adaptive air suspension, and 360-degree cameras. Factory tow package and all-terrain progress control. Serviced exclusively at Land Rover Denver. Extended warranty transferable.',
      images: [
        'https://placehold.co/600x400?text=RR+Sport+Front',
        'https://placehold.co/600x400?text=RR+Sport+Side',
        'https://placehold.co/600x400?text=RR+Sport+Interior',
      ],
      transmission: 'automatic', drivetrain: 'awd',
    },
  },
  {
    seller: 'rachel.green@example.com',
    vehicle: {
      make: 'RAM', model: '2500', year: 2020,
      mileage: 45000, price: 52000,
      zipCode: '78701',
      description: 'Work-ready 2020 RAM 2500 Laramie with the legendary 6.7L Cummins turbo diesel. 4WD, crew cab, 6.5-foot bed with spray-in liner. Fifth-wheel prep package, exhaust brake, and 20-inch polished aluminum wheels. Tows 19,780 lbs like it is nothing. All scheduled maintenance completed at the dealership.',
      images: [
        'https://placehold.co/600x400?text=RAM+2500+Front',
        'https://placehold.co/600x400?text=RAM+2500+Side',
        'https://placehold.co/600x400?text=RAM+2500+Interior',
      ],
      transmission: 'automatic', drivetrain: '4wd',
    },
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
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, first_name = $3, last_name = $4, role = $5, primary_intent = $6
       RETURNING id, email, role`,
      [u.email, hash, u.firstName, u.lastName, u.role, u.primaryIntent]
    );
    const user = result.rows[0];
    userIds[u.email] = user.id;
    console.log(`  ${user.role}: ${user.email} (${user.id})`);
  }

  // Idempotency: delete existing listings and vehicles for seeded users
  const allUserIds = Object.values(userIds);
  console.log('\nCleaning up existing seed data...');
  // Delete dependent records first (foreign key order)
  const delIntros = await pool.query('DELETE FROM introductions WHERE seller_id = ANY($1::uuid[]) OR buyer_id = ANY($1::uuid[])', [allUserIds]);
  console.log(`  Deleted ${delIntros.rowCount} existing introductions`);
  const delNotifs = await pool.query('DELETE FROM notifications WHERE user_id = ANY($1::uuid[])', [allUserIds]);
  console.log(`  Deleted ${delNotifs.rowCount} existing notifications`);
  const delFavs = await pool.query('DELETE FROM favorites WHERE user_id = ANY($1::uuid[])', [allUserIds]);
  console.log(`  Deleted ${delFavs.rowCount} existing favorites`);
  const delListings = await pool.query('DELETE FROM want_listings WHERE user_id = ANY($1::uuid[])', [allUserIds]);
  console.log(`  Deleted ${delListings.rowCount} existing want listings`);
  const delVehicles = await pool.query('DELETE FROM vehicles WHERE user_id = ANY($1::uuid[])', [allUserIds]);
  console.log(`  Deleted ${delVehicles.rowCount} existing vehicles`);
  console.log('\nSeeding sample want listings...');

  for (const assignment of listingAssignments) {
    const buyerId = userIds[assignment.buyer];
    const listing = assignment.listing;

    const result = await pool.query(
      `INSERT INTO want_listings (user_id, title, make, model, year_min, year_max, budget_min, budget_max, zip_code, radius_miles, mileage_max, description, transmission, drivetrain, condition)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, title`,
      [buyerId, listing.title, listing.make, listing.model, listing.yearMin, listing.yearMax, listing.budgetMin, listing.budgetMax, listing.zipCode, listing.radiusMiles, listing.mileageMax, listing.description, listing.transmission, listing.drivetrain, listing.condition]
    );
    console.log(`  Listing: ${result.rows[0].title} (${result.rows[0].id})`);
  }

  console.log('\nSeeding sample vehicles...');

  for (const assignment of vehicleAssignments) {
    const sellerId = userIds[assignment.seller];
    const v = assignment.vehicle;

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
