const pool = require('../db/pool');

async function createNotification({ userId, type, message, relatedId }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, message, related_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, type, message, relatedId || null]
  );
  return result.rows[0];
}

async function getNotifications(userId) {
  const result = await pool.query(
    `SELECT id, type, message, read, related_id, created_at
     FROM notifications WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function markRead(id, userId) {
  const result = await pool.query(
    `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return result.rows[0];
}

async function markAllRead(userId) {
  await pool.query(
    `UPDATE notifications SET read = true WHERE user_id = $1 AND read = false`,
    [userId]
  );
}

async function getUnreadCount(userId) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false`,
    [userId]
  );
  return parseInt(result.rows[0].count);
}

module.exports = { createNotification, getNotifications, markRead, markAllRead, getUnreadCount };
