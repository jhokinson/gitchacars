const pool = require('../db/pool');

async function create({ vehicleId, wantListingId, sellerId, buyerId, message }) {
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  const result = await pool.query(
    `INSERT INTO introductions (vehicle_id, want_listing_id, seller_id, buyer_id, message, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [vehicleId, wantListingId, sellerId, buyerId, message, expiresAt]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query('SELECT * FROM introductions WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findByVehicleAndListing(vehicleId, wantListingId) {
  const result = await pool.query(
    'SELECT * FROM introductions WHERE vehicle_id = $1 AND want_listing_id = $2',
    [vehicleId, wantListingId]
  );
  return result.rows[0] || null;
}

async function updateStatus(id, status) {
  const result = await pool.query(
    `UPDATE introductions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
}

async function getReceivedByBuyer(buyerId, statusFilter) {
  let sql = `
    SELECT i.*,
      u.first_name AS seller_first_name,
      v.make AS vehicle_make, v.model AS vehicle_model, v.year AS vehicle_year,
      v.price AS vehicle_price, v.images AS vehicle_images,
      wl.title AS want_listing_title
    FROM introductions i
    JOIN users u ON u.id = i.seller_id
    JOIN vehicles v ON v.id = i.vehicle_id
    JOIN want_listings wl ON wl.id = i.want_listing_id
    WHERE i.buyer_id = $1`;
  const params = [buyerId];

  if (statusFilter) {
    sql += ` AND i.status = $2`;
    params.push(statusFilter);
  }
  sql += ` ORDER BY i.created_at DESC`;

  const result = await pool.query(sql, params);
  return result.rows;
}

async function getSentBySeller(sellerId, statusFilter) {
  let sql = `
    SELECT i.*,
      u.first_name AS buyer_first_name,
      v.make AS vehicle_make, v.model AS vehicle_model, v.year AS vehicle_year,
      v.price AS vehicle_price, v.images AS vehicle_images,
      wl.title AS want_listing_title, wl.make AS wl_make, wl.model AS wl_model,
      wl.year_min AS wl_year_min, wl.year_max AS wl_year_max
    FROM introductions i
    JOIN users u ON u.id = i.buyer_id
    JOIN vehicles v ON v.id = i.vehicle_id
    JOIN want_listings wl ON wl.id = i.want_listing_id
    WHERE i.seller_id = $1`;
  const params = [sellerId];

  if (statusFilter) {
    sql += ` AND i.status = $2`;
    params.push(statusFilter);
  }
  sql += ` ORDER BY i.created_at DESC`;

  const result = await pool.query(sql, params);
  return result.rows;
}

async function expirePending() {
  const result = await pool.query(
    `UPDATE introductions SET status = 'expired', updated_at = NOW()
     WHERE status = 'pending' AND expires_at < NOW()
     RETURNING id`
  );
  return result.rowCount;
}

module.exports = { create, findById, findByVehicleAndListing, updateStatus, getReceivedByBuyer, getSentBySeller, expirePending };
