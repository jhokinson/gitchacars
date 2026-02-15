const pool = require('../db/pool');

async function createUser({ email, passwordHash, firstName, lastName, role, primaryIntent }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, primary_intent)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, first_name, last_name, role, primary_intent, created_at`,
    [email, passwordHash, firstName, lastName, role || 'user', primaryIntent || 'buy']
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await pool.query(
    'SELECT id, email, first_name, last_name, role, primary_intent, avatar_url, google_id, created_at, deleted_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByGoogleId(googleId) {
  const result = await pool.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );
  return result.rows[0] || null;
}

async function createGoogleUser({ email, firstName, lastName, googleId, avatarUrl, primaryIntent }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, google_id, avatar_url, primary_intent)
     VALUES ($1, NULL, $2, $3, 'user', $4, $5, $6)
     RETURNING id, email, first_name, last_name, role, primary_intent, google_id, avatar_url, created_at`,
    [email, firstName, lastName, googleId, avatarUrl, primaryIntent || 'buy']
  );
  return result.rows[0];
}

module.exports = { createUser, findByEmail, findById, findByGoogleId, createGoogleUser };
