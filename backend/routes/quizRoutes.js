const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuiz,
  submitQuiz,
  updateQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createQuiz);
router.get('/:id', protect, getQuiz);
router.put('/:id', protect, authorize('instructor', 'admin'), updateQuiz);
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
