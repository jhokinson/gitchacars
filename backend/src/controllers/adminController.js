const pool = require('../db/pool');
const { success, error } = require('../utils/response');

async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search || null;

    let countSql = 'SELECT COUNT(*) FROM users';
    let dataSql = 'SELECT id, email, first_name, last_name, role, created_at FROM users';
    const params = [];

    if (search) {
      const where = ' WHERE LOWER(email) LIKE LOWER($1)';
      countSql += where;
      dataSql += where;
      params.push(`%${search}%`);
    }

    dataSql += ' ORDER BY created_at DESC';
    dataSql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    const countResult = await pool.query(countSql, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(dataSql, [...params, limit, offset]);

    success(res, {
      users: result.rows.map(r => ({
        id: r.id, email: r.email, firstName: r.first_name,
        lastName: r.last_name, role: r.role, createdAt: r.created_at,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getWantListings(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM want_listings');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM want_listings ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    success(res, {
      listings: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getVehicles(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM vehicles');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM vehicles ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    success(res, {
      vehicles: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return error(res, 'User not found', 404);
    }

    await pool.query('UPDATE users SET deleted_at = NOW() WHERE id = $1', [id]);
    await pool.query("UPDATE want_listings SET status = 'deleted' WHERE user_id = $1", [id]);
    await pool.query("UPDATE vehicles SET status = 'deleted' WHERE user_id = $1", [id]);

    success(res, { message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

async function deleteWantListing(req, res, next) {
  try {
    const result = await pool.query(
      "UPDATE want_listings SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return error(res, 'Listing not found', 404);
    }
    success(res, { message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
}

async function deleteVehicle(req, res, next) {
  try {
    const result = await pool.query(
      "UPDATE vehicles SET status = 'deleted', updated_at = NOW() WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return error(res, 'Vehicle not found', 404);
    }
    success(res, { message: 'Vehicle deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUsers, getWantListings, getVehicles, deleteUser, deleteWantListing, deleteVehicle };
