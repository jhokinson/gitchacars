const pool = require('../db/pool');

async function create(userId, data) {
  const result = await pool.query(
    `INSERT INTO vehicles (user_id, make, model, year, mileage, price, zip_code, description, images, transmission, drivetrain)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [userId, data.make, data.model, data.year, data.mileage, data.price, data.zipCode, data.description, data.images, data.transmission || null, data.drivetrain || null]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const columnMap = {
    make: 'make', model: 'model', year: 'year',
    mileage: 'mileage', price: 'price',
    zipCode: 'zip_code', description: 'description',
    images: 'images', transmission: 'transmission',
    drivetrain: 'drivetrain',
  };

  for (const [key, col] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      fields.push(`${col} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
  }

  if (fields.length === 0) return findById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function listByUser(userId) {
  const result = await pool.query(
    'SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function findMatches(vehicle, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  // Haversine formula in SQL using zip_codes table
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM want_listings wl
     JOIN zip_codes vz ON vz.zip = $1
     JOIN zip_codes wz ON wz.zip = wl.zip_code
     WHERE wl.status = 'active'
       AND LOWER(wl.make) = LOWER($2)
       AND LOWER(wl.model) = LOWER($3)
       AND $4 BETWEEN wl.year_min AND wl.year_max
       AND $5 BETWEEN wl.budget_min AND wl.budget_max
       AND $6 <= wl.mileage_max
       AND (2 * 3959 * ASIN(SQRT(
           POWER(SIN(RADIANS(wz.latitude - vz.latitude) / 2), 2) +
           COS(RADIANS(vz.latitude)) * COS(RADIANS(wz.latitude)) *
           POWER(SIN(RADIANS(wz.longitude - vz.longitude) / 2), 2)
         ))) <= wl.radius_miles
       AND NOT EXISTS (
         SELECT 1 FROM introductions i WHERE i.vehicle_id = $7 AND i.want_listing_id = wl.id
       )`,
    [vehicle.zip_code, vehicle.make, vehicle.model, vehicle.year, vehicle.price, vehicle.mileage, vehicle.id]
  );
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(
    `SELECT wl.*, u.first_name AS buyer_first_name
     FROM want_listings wl
     JOIN users u ON u.id = wl.user_id
     JOIN zip_codes vz ON vz.zip = $1
     JOIN zip_codes wz ON wz.zip = wl.zip_code
     WHERE wl.status = 'active'
       AND LOWER(wl.make) = LOWER($2)
       AND LOWER(wl.model) = LOWER($3)
       AND $4 BETWEEN wl.year_min AND wl.year_max
       AND $5 BETWEEN wl.budget_min AND wl.budget_max
       AND $6 <= wl.mileage_max
       AND (2 * 3959 * ASIN(SQRT(
           POWER(SIN(RADIANS(wz.latitude - vz.latitude) / 2), 2) +
           COS(RADIANS(vz.latitude)) * COS(RADIANS(wz.latitude)) *
           POWER(SIN(RADIANS(wz.longitude - vz.longitude) / 2), 2)
         ))) <= wl.radius_miles
       AND NOT EXISTS (
         SELECT 1 FROM introductions i WHERE i.vehicle_id = $7 AND i.want_listing_id = wl.id
       )
     ORDER BY wl.created_at DESC
     LIMIT $8 OFFSET $9`,
    [vehicle.zip_code, vehicle.make, vehicle.model, vehicle.year, vehicle.price, vehicle.mileage, vehicle.id, limit, offset]
  );

  return { listings: result.rows, total, page, totalPages: Math.ceil(total / limit) };
}

module.exports = { create, findById, update, listByUser, findMatches };
