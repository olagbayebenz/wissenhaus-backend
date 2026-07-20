const jwt = require('jwt-simple');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

function parseExpiry(expiry) {
  const units = { h: 3600, d: 86400, w: 604800 };
  const match = expiry.match(/^(\d+)([hdw])$/);
  if (!match) return 86400; // default 1 day
  return parseInt(match[1]) * units[match[2]];
}

const auth = {
  // Hash password
  hashPassword: async (password) => {
    return bcrypt.hash(password, 10);
  },

  // Compare password
  comparePassword: async (password, hash) => {
    return bcrypt.compare(password, hash);
  },

  // Generate JWT token
  generateToken: (userId, email) => {
    const exp = Math.floor(Date.now() / 1000) + parseExpiry(JWT_EXPIRY);
    return jwt.encode({ userId, email, exp }, JWT_SECRET);
  },

  // Generate refresh token (longer expiry)
  generateRefreshToken: (userId) => {
    const exp = Math.floor(Date.now() / 1000) + parseExpiry(process.env.REFRESH_TOKEN_EXPIRY || '7d');
    return jwt.encode({ userId, type: 'refresh', exp }, JWT_SECRET);
  },

  // Verify token
  verifyToken: (token) => {
    try {
      const decoded = jwt.decode(token, JWT_SECRET);
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      return decoded;
    } catch (err) {
      throw new Error('Invalid token');
    }
  },

  // Middleware to verify JWT in request
  verifyJWT: (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = auth.verifyToken(token);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
};

module.exports = auth;
