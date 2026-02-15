const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

const RETRYABLE_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', '57P01', '08006', '08001']);
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Wrap pool with retry logic for connection errors (Neon cold starts)
const retryPool = {
  query: async (...args) => {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await pool.query(...args);
      } catch (err) {
        const code = err.code || '';
        if (attempt < MAX_RETRIES && RETRYABLE_CODES.has(code)) {
          console.warn(`[DB] Retrying query after connection error (${code}), attempt ${attempt + 1}/${MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        } else {
          throw err;
        }
      }
    }
  },
  connect: (...args) => pool.connect(...args),
  end: (...args) => pool.end(...args),
  on: (...args) => pool.on(...args),
};

module.exports = retryPool;
