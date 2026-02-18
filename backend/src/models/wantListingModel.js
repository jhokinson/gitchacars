const pool = require('../db/pool');

async function create(userId, data) {
  // Compute combined features for backward compat
  const mustHave = data.featuresMustHave || [];
  const niceToHave = data.featuresNiceToHave || [];
  const combinedFeatures = data.features || [...mustHave, ...niceToHave];

  const result = await pool.query(
    `INSERT INTO want_listings (user_id, title, make, model, year_min, year_max, budget_min, budget_max, zip_code, radius_miles, mileage_max, description, transmission, drivetrain, condition, features, vehicle_type, features_must_have, features_nice_to_have)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     RETURNING *`,
    [userId, data.title, data.make, data.model, data.yearMin, data.yearMax, data.budgetMin, data.budgetMax, data.zipCode, data.radiusMiles, data.mileageMax, data.description, data.transmission || null, data.drivetrain || null, data.condition || null, combinedFeatures, data.vehicleType || null, mustHave, niceToHave]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM want_listings WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function update(id, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  const columnMap = {
    title: 'title', make: 'make', model: 'model',
    yearMin: 'year_min', yearMax: 'year_max',
    budgetMin: 'budget_min', budgetMax: 'budget_max',
    zipCode: 'zip_code', radiusMiles: 'radius_miles',
    mileageMax: 'mileage_max', description: 'description',
    transmission: 'transmission', drivetrain: 'drivetrain',
    condition: 'condition',
    features: 'features',
    vehicleType: 'vehicle_type',
    featuresMustHave: 'features_must_have',
    featuresNiceToHave: 'features_nice_to_have',
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
    `UPDATE want_listings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}

async function archive(id) {
  const result = await pool.query(
    `UPDATE want_listings SET status = 'archived', updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
}

async function listActive({ page = 1, limit = 20, make, model, yearMin, yearMax, budgetMin, budgetMax, mileageMax, transmission, drivetrain, zipCode, radius, keyword, vehicleTypes, sort = 'newest', userId } = {}) {
  limit = Math.min(limit, 50);
  const offset = (page - 1) * limit;

  // Build filter conditions (shared by count and main query)
  const filterConditions = [`wl.status = 'active'`];
  const filterValues = [];
  let idx = 1;

  if (make) {
    filterConditions.push(`wl.make ILIKE $${idx}`);
    filterValues.push(`%${make}%`);
    idx++;
  }
  if (model) {
    filterConditions.push(`wl.model ILIKE $${idx}`);
    filterValues.push(`%${model}%`);
    idx++;
  }
  if (yearMin) {
    filterConditions.push(`wl.year_max >= $${idx}`);
    filterValues.push(parseInt(yearMin));
    idx++;
  }
  if (yearMax) {
    filterConditions.push(`wl.year_min <= $${idx}`);
    filterValues.push(parseInt(yearMax));
    idx++;
  }
  if (budgetMin) {
    filterConditions.push(`wl.budget_max >= $${idx}`);
    filterValues.push(parseFloat(budgetMin));
    idx++;
  }
  if (budgetMax) {
    filterConditions.push(`wl.budget_min <= $${idx}`);
    filterValues.push(parseFloat(budgetMax));
    idx++;
  }
  if (mileageMax) {
    filterConditions.push(`wl.mileage_max <= $${idx}`);
    filterValues.push(parseInt(mileageMax));
    idx++;
  }
  if (transmission) {
    filterConditions.push(`wl.transmission = $${idx}`);
    filterValues.push(transmission.toLowerCase());
    idx++;
  }
  if (drivetrain) {
    filterConditions.push(`wl.drivetrain = $${idx}`);
    filterValues.push(drivetrain.toLowerCase());
    idx++;
  }
  if (keyword) {
    filterConditions.push(`(wl.title ILIKE $${idx} OR wl.description ILIKE $${idx})`);
    filterValues.push(`%${keyword}%`);
    idx++;
  }
  if (vehicleTypes && Array.isArray(vehicleTypes) && vehicleTypes.length > 0) {
    filterConditions.push(`LOWER(wl.vehicle_type) = ANY($${idx}::text[])`);
    filterValues.push(vehicleTypes.map(t => t.toLowerCase()));
    idx++;
  }

  let locationJoin = '';
  if (zipCode && radius) {
    locationJoin = `LEFT JOIN zip_codes zc_origin ON zc_origin.zip = $${idx}
                    LEFT JOIN zip_codes zc_listing ON zc_listing.zip = wl.zip_code`;
    filterValues.push(zipCode);
    idx++;
    filterConditions.push(`(
      zc_origin.latitude IS NOT NULL AND zc_listing.latitude IS NOT NULL AND
      (3959 * acos(LEAST(1.0, GREATEST(-1.0,
        cos(radians(zc_origin.latitude)) * cos(radians(zc_listing.latitude)) *
        cos(radians(zc_listing.longitude) - radians(zc_origin.longitude)) +
        sin(radians(zc_origin.latitude)) * sin(radians(zc_listing.latitude))
      )))) <= $${idx}
    )`);
    filterValues.push(parseFloat(radius));
    idx++;
  }

  const whereClause = filterConditions.join(' AND ');

  // Count query (no favorites join needed)
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM want_listings wl
     JOIN users u ON u.id = wl.user_id
     ${locationJoin}
     WHERE ${whereClause}`,
    filterValues
  );
  const total = parseInt(countResult.rows[0].count);

  // Main query with favorites and pagination
  const mainValues = [...filterValues];
  let mainIdx = idx;

  let favJoin = '';
  let favSelect = ', false AS is_favorited';
  if (userId) {
    favJoin = `LEFT JOIN favorites f ON f.want_listing_id = wl.id AND f.user_id = $${mainIdx}`;
    favSelect = ', CASE WHEN f.id IS NOT NULL THEN true ELSE false END AS is_favorited';
    mainValues.push(userId);
    mainIdx++;
  }

  const sortMap = {
    newest: 'wl.created_at DESC',
    oldest: 'wl.created_at ASC',
    budget_asc: 'wl.budget_min ASC',
    budget_desc: 'wl.budget_max DESC',
  };
  const orderBy = sortMap[sort] || sortMap.newest;

  mainValues.push(limit);
  const limitIdx = mainIdx;
  mainIdx++;
  mainValues.push(offset);
  const offsetIdx = mainIdx;

  const result = await pool.query(
    `SELECT wl.*, u.id AS buyer_id, u.first_name AS buyer_first_name ${favSelect}
     FROM want_listings wl
     JOIN users u ON u.id = wl.user_id
     ${locationJoin}
     ${favJoin}
     WHERE ${whereClause}
     ORDER BY ${orderBy}
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    mainValues
  );

  return { listings: result.rows, total, page, totalPages: Math.ceil(total / limit) };
}

async function listByUser(userId) {
  const result = await pool.query(
    `SELECT wl.*, (SELECT COUNT(*) FROM introductions i WHERE i.want_listing_id = wl.id) AS intro_count
     FROM want_listings wl
     WHERE wl.user_id = $1
     ORDER BY wl.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function findByIdWithBuyer(id) {
  const result = await pool.query(
    `SELECT wl.*, u.first_name AS buyer_first_name
     FROM want_listings wl
     JOIN users u ON u.id = wl.user_id
     WHERE wl.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function priceDistribution() {
  const result = await pool.query(
    `SELECT width_bucket(budget_max, 0, 200000, 20) AS bucket, COUNT(*)::int AS count
     FROM want_listings
     WHERE status = 'active' AND budget_max IS NOT NULL
     GROUP BY bucket ORDER BY bucket`
  );
  // Fill in missing buckets with 0
  const bucketMap = {};
  for (const row of result.rows) {
    bucketMap[row.bucket] = row.count;
  }
  const buckets = [];
  for (let i = 1; i <= 20; i++) {
    buckets.push({ bucket: i, count: bucketMap[i] || 0 });
  }
  return buckets;
}

module.exports = { create, findById, update, archive, listActive, listByUser, findByIdWithBuyer, priceDistribution };
