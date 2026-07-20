const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const validators = require('../utils/validators');

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
