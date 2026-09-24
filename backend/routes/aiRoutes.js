const express = require('express');
const router = express.Router();
const { generateCourse } = require('../controllers/aiController');
const { optionalProtect } = require('../middleware/authMiddleware');

// POST /api/ai/generate-course  — AI-powered course and video generator
router.post('/generate-course', optionalProtect, generateCourse);

module.exports = router;

