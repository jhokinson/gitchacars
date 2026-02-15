const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { success, error } = require('../utils/response');

// Lazy-load google-auth-library to avoid blocking server startup
let _client = null;
function getGoogleClient() {
  if (!_client) {
    const { OAuth2Client } = require('google-auth-library');
    _client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return _client;
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function formatUser(row) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    primaryIntent: row.primary_intent || 'buy',
    avatarUrl: row.avatar_url || null,
    createdAt: row.created_at,
  };
}

async function googleSignIn(req, res, next) {
  try {
    const { idToken, primaryIntent } = req.body;

    if (!idToken) {
      return error(res, 'Google ID token is required', 400);
    }

    let payload;
    try {
      const ticket = await getGoogleClient().verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      return error(res, 'Invalid Google token', 401);
    }

    const { email, given_name, family_name, sub, picture } = payload;

    // Check if user exists by email
    let user = await userModel.findByEmail(email);
    let isNewUser = false;

    if (user) {
      // Existing user — log them in
      // If they don't have a google_id yet, link the account
      if (!user.google_id) {
        const pool = require('../db/pool');
        await pool.query(
          'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3',
          [sub, picture, user.id]
        );
        user.google_id = sub;
        user.avatar_url = user.avatar_url || picture;
      }
    } else {
      // New user — create account
      user = await userModel.createGoogleUser({
        email,
        firstName: given_name || '',
        lastName: family_name || '',
        googleId: sub,
        avatarUrl: picture,
        primaryIntent: primaryIntent || 'buy',
      });
      isNewUser = true;
    }

    const token = generateToken(user);

    success(res, {
      user: formatUser(user),
      token,
      isNewUser,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { googleSignIn };
