const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { sendWelcomeEmail } = require('../services/emailService');
const { success, error } = require('../utils/response');

const SALT_ROUNDS = 10;

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

async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName, role, primaryIntent } = req.body;

    const fields = {};
    if (!email) fields.email = 'Email is required';
    if (!password) fields.password = 'Password is required';
    if (!firstName) fields.firstName = 'First name is required';
    if (!lastName) fields.lastName = 'Last name is required';

    if (password && password.length < 6) {
      fields.password = 'Password must be at least 6 characters';
    }

    if (role && !['buyer', 'seller'].includes(role)) {
      fields.role = 'Role must be buyer or seller';
    }

    if (Object.keys(fields).length > 0) {
      return error(res, 'Validation failed', 400, fields);
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      return error(res, 'Email already in use', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userModel.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      role: role || 'user',
      primaryIntent: primaryIntent || 'buy',
    });

    const token = generateToken(user);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user);

    success(res, { user: formatUser(user), token }, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    if (user.deleted_at) {
      return error(res, 'Account has been deactivated', 401);
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user);

    success(res, { user: formatUser(user), token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
