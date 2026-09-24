const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignment,
  submitAssignment,
  getInstructorSubmissions,
  gradeSubmission
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/course/:courseId', protect, authorize('instructor', 'admin'), createAssignment);
router.get('/instructor/submissions', protect, authorize('instructor', 'admin'), getInstructorSubmissions);
router.put('/submissions/:submissionId/grade', protect, authorize('instructor', 'admin'), gradeSubmission);
router.get('/:id', protect, getAssignment);
router.post('/:id/submit', protect, submitAssignment);

module.exports = router;
