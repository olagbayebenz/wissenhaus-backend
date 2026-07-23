const express = require('express');
const router = express.Router();
const pool = require('../db/connection');
const auth = require('../utils/auth');
const validators = require('../utils/validators');

// Get course progress
router.get('/:courseId/progress', auth.verifyJWT, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      'SELECT module_id, completed_at, quiz_score FROM course_progress WHERE user_id = $1 AND course_id = $2 ORDER BY module_id',
      [req.user.userId, courseId]
    );

    const completedModules = result.rows
      .filter(r => r.completed_at)
      .map(r => r.module_id);

    res.json({
      courseId,
      completedModules,
      totalModules: courseId === 'soft-skills' ? 10 : 10,
      progress: result.rows.map(r => ({
        moduleId: r.module_id,
        completed: !!r.completed_at,
        completedAt: r.completed_at,
        quizScore: r.quiz_score
      }))
    });
  } catch (err) {
    next(err);
  }
});

// Submit quiz
router.post('/:courseId/module/:moduleId/quiz', auth.verifyJWT, async (req, res, next) => {
  try {
    const data = validators.validate(req.body, validators.quizSchema);
    const { courseId, moduleId } = req.params;

    const correctAnswers = data.answers.filter((ans, idx) => {
      const correctKey = ['b', 'b', 'b'];
      return ans === correctKey[idx];
    }).length;

    const score = Math.round((correctAnswers / 3) * 100);
    const passed = score >= 80;

    await pool.query(
      `INSERT INTO course_progress (user_id, course_id, module_id, quiz_score, completed_at)
       VALUES ($1, $2, $3, $4, ${passed ? 'CURRENT_TIMESTAMP' : 'NULL'})
       ON CONFLICT (user_id, course_id, module_id)
       DO UPDATE SET quiz_score = $4, completed_at = ${passed ? 'CURRENT_TIMESTAMP' : 'NULL'}`,
      [req.user.userId, courseId, moduleId, score]
    );

    if (passed) {
      const progress = await pool.query(
        'SELECT COUNT(DISTINCT module_id) as completed FROM course_progress WHERE user_id = $1 AND course_id = $2 AND completed_at IS NOT NULL',
        [req.user.userId, courseId]
      );

      const totalModules = courseId === 'soft-skills' ? 10 : 10;
      const allCompleted = progress.rows[0].completed === totalModules;

      if (allCompleted) {
        const certResult = await pool.query(
          'SELECT id FROM certificates WHERE user_id = $1 AND course_id = $2',
          [req.user.userId, courseId]
        );

        if (certResult.rows.length === 0) {
          const certificateId = `WH-${courseId.toUpperCase().slice(0, 3)}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
          await pool.query(
            `INSERT INTO certificates (user_id, course_id, certificate_id, issued_at, certificate_data)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)`,
            [req.user.userId, courseId, certificateId, JSON.stringify({ issued: true })]
          );
        }
      }
    }

    res.json({
      passed,
      score,
      message: passed ? 'Quiz passed! Moving to next module.' : `Score ${score}%. Need 80% to pass.`
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message, errors: err.errors });
    }
    next(err);
  }
});

// Get certificate
router.get('/:courseId/certificate', auth.verifyJWT, async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      'SELECT id, certificate_id, issued_at, certificate_data FROM certificates WHERE user_id = $1 AND course_id = $2',
      [req.user.userId, courseId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const cert = result.rows[0];
    res.json({
      certificateId: cert.certificate_id,
      issuedAt: cert.issued_at,
      courseId
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
