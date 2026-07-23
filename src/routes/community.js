const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const auth = require('../utils/auth');
const validators = require('../utils/validators');

// Get all threads
router.get('/threads', async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT t.id, t.title, t.category, t.views, t.created_at,
             u.name as author_name, COUNT(p.id) as post_count
      FROM threads t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN posts p ON t.id = p.thread_id
    `;

    const params = [];
    if (category) {
      query += 'WHERE t.category = $1 ';
      params.push(category);
    }

    query += 'GROUP BY t.id, u.id ORDER BY t.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);

    res.json({
      threads: result.rows.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        authorName: t.author_name,
        views: t.views,
        postCount: parseInt(t.post_count),
        createdAt: t.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Create thread
router.post('/threads', auth.verifyJWT, async (req, res, next) => {
  try {
    const data = validators.validate(req.body, validators.threadSchema);

    const result = await pool.query(
      `INSERT INTO threads (user_id, title, category, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, category, content, created_at`,
      [req.user.userId, data.title, data.category, data.content]
    );

    const thread = result.rows[0];

    await pool.query(
      'INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3)',
      [thread.id, req.user.userId, data.content]
    );

    res.status(201).json({
      id: thread.id,
      title: thread.title,
      category: thread.category,
      content: thread.content,
      createdAt: thread.created_at
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

// Get single thread
router.get('/threads/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE threads SET views = views + 1 WHERE id = $1', [id]);

    const threadResult = await pool.query(
      `SELECT t.id, t.title, t.category, t.content, t.views, t.created_at,
              u.name as author_name, u.email as author_email
       FROM threads t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (threadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const thread = threadResult.rows[0];

    const postsResult = await pool.query(
      `SELECT p.id, p.content, p.created_at,
              u.name as author_name
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.thread_id = $1
       ORDER BY p.created_at ASC`,
      [id]
    );

    res.json({
      id: thread.id,
      title: thread.title,
      category: thread.category,
      authorName: thread.author_name,
      authorEmail: thread.author_email,
      views: thread.views,
      createdAt: thread.created_at,
      posts: postsResult.rows.map(p => ({
        id: p.id,
        content: p.content,
        authorName: p.author_name,
        createdAt: p.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Create post (reply)
router.post('/threads/:id/posts', auth.verifyJWT, async (req, res, next) => {
  try {
    const data = validators.validate(req.body, validators.postSchema);
    const { id } = req.params;

    const threadCheck = await pool.query('SELECT id FROM threads WHERE id = $1', [id]);
    if (threadCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const result = await pool.query(
      'INSERT INTO posts (thread_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at',
      [id, req.user.userId, data.content]
    );

    const post = result.rows[0];

    res.status(201).json({
      id: post.id,
      content: post.content,
      createdAt: post.created_at
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

module.exports = router;
