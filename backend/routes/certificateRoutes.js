const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getMyCertificates,
  verifyCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');

// Public verification endpoint
router.get('/verify/:certNumber', verifyCertificate);

// Protected student certificate endpoints
router.get('/my-certificates', protect, getMyCertificates);
router.post('/generate/:courseId', protect, generateCertificate);

module.exports = router;
