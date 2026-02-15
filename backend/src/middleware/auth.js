const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Authentication required' } });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: { message: 'Invalid or expired token' } });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { message: 'Forbidden' } });
    }
    next();
  };
};

const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = { userId: payload.userId, role: payload.role };
  } catch (err) {
    // Invalid token on optional auth — just continue without user
  }
  next();
};

module.exports = { authenticate, requireRole, optionalAuth };
