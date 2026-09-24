const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getInstructorCourses,
  getInstructorAnalytics
} = require('../controllers/courseController');
const { enrollCourse, getMyLearning, getCourseLearningData } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public catalog routes
router.get('/', getCourses);

// Student learning & enrollment routes
router.get('/my-learning', protect, getMyLearning);
router.get('/:courseId/learn', protect, getCourseLearningData);
router.post('/:courseId/enroll', protect, enrollCourse);

// Instructor routes
router.get('/instructor/my-courses', protect, authorize('instructor', 'admin'), getInstructorCourses);
router.get('/instructor/analytics', protect, authorize('instructor', 'admin'), getInstructorAnalytics);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// Single course details (public preview)
router.get('/:id', getCourse);

module.exports = router;
