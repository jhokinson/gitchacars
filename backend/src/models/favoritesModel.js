const pool = require('../db/pool');

async function add(userId, wantListingId) {
  const result = await pool.query(
    `INSERT INTO favorites (user_id, want_listing_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, want_listing_id) DO NOTHING
     RETURNING *`,
    [userId, wantListingId]
  );
  return result.rows[0] || null;
}

async function remove(userId, wantListingId) {
  const result = await pool.query(
    `DELETE FROM favorites WHERE user_id = $1 AND want_listing_id = $2 RETURNING *`,
    [userId, wantListingId]
  );
  return result.rows[0] || null;
}

async function listByUser(userId) {
  const result = await pool.query(
    `SELECT want_listing_id FROM favorites WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows.map((r) => r.want_listing_id);
}

module.exports = { add, remove, listByUser };
