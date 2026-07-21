const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const validators = require('../utils/validators');

// Generic submission handler (for all forms)
router.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, city, experience, type, submittedAt } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required fields: firstName, lastName, email' });
    }

    const result = await pool.query(
      `INSERT INTO submissions (type, name, email, phone, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       RETURNING id, created_at`,
      [
        type || 'general',
        `${firstName} ${lastName}`,
        email,
        phone || null,
        JSON.stringify({ firstName, lastName, email, phone, city, experience, type, submittedAt }),
        submittedAt || new Date().toISOString(),
        new Date().toISOString()
      ]
    );

    const submission = Array.isArray(result.rows) ? result.rows[0] : result;

    res.status(201).json({
      success: true,
      id: submission.id,
      message: 'Thank you for your submission! We will review it shortly and contact you if needed.',
      submittedAt: submission.created_at
    });
  } catch (err) {
    console.error('Submission error:', err);
    next(err);
  }
});

// Submit volunteer application
router.post('/volunteer', async (req, res, next) => {
  try {
    const data = validators.validate(req.body, validators.volunteerSchema);

    const result = await pool.query(
      `INSERT INTO submissions (type, name, email, phone, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        `volunteer_${data.type}`,
        `${data.firstName} ${data.lastName}`,
        data.email,
        data.phone,
        JSON.stringify(data)
      ]
    );

    const submission = result.rows[0];

    res.status(201).json({
      id: submission.id,
      message: 'Application received! We will review and contact you soon.',
      submittedAt: submission.created_at
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

// Submit partnership application
router.post('/partnership', async (req, res, next) => {
  try {
    const schema = validators.volunteerSchema; // Reuse for now
    const data = validators.validate(req.body, schema);

    const result = await pool.query(
      `INSERT INTO submissions (type, name, email, phone, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [
        'partnership',
        `${data.firstName} ${data.lastName}`,
        data.email,
        data.phone,
        JSON.stringify(data)
      ]
    );

    const submission = result.rows[0];

    res.status(201).json({
      id: submission.id,
      message: 'Partnership inquiry received! We will be in touch soon.',
      submittedAt: submission.created_at
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

// Submit contact form
router.post('/contact', async (req, res, next) => {
  try {
    const contactSchema = validators.volunteerSchema;
    const data = validators.validate(req.body, contactSchema);

    await pool.query(
      `INSERT INTO submissions (type, name, email, phone, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'contact',
        `${data.firstName} ${data.lastName}`,
        data.email,
        data.phone,
        JSON.stringify(data)
      ]
    );

    res.status(201).json({
      message: 'Message received! We will get back to you shortly.'
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

module.exports = router;
