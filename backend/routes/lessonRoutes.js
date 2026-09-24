const express = require('express');
const router = express.Router();
const {
  createLesson,
  getLesson,
  updateLesson,
  deleteLesson,
  completeLesson
} = require('../controllers/lessonController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/section/:sectionId', protect, authorize('instructor', 'admin'), createLesson);
router.get('/:id', protect, getLesson);
router.put('/:id', protect, authorize('instructor', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteLesson);
router.post('/:id/complete', protect, completeLesson);

module.exports = router;
