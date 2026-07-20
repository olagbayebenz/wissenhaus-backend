const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const auth = require('../utils/auth');
const validators = require('../utils/validators');

// Register
router.post('/register', async (req, res, next) => {
  try {
    const data = validators.validate(req.body, validators.registerSchema);

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const passwordHash = await auth.hashPassword(data.password);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [data.email, passwordHash, data.name]
    );

    const user = result.rows[0];
    const token = auth.generateToken(user.id, user.email);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data = validators.validate(req.body, validators.loginSchema);

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [data.email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await auth.comparePassword(data.password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const token = auth.generateToken(user.id, user.email);
    const refreshToken = auth.generateRefreshToken(user.id);

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
      refreshToken
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

// Get current user
router.get('/me', auth.verifyJWT, async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = auth.verifyToken(refreshToken);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [decoded.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    const newToken = auth.generateToken(user.id, user.email);

    res.json({ token: newToken });
  } catch (err) {
    if (err.message.includes('token')) {
      return res.status(401).json({ error: err.message });
    }
    next(err);
  }
});

module.exports = router;
