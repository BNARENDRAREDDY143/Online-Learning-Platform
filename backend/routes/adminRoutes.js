const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  getCategories,
  createCategory,
  deleteCategory
} = require('../controllers/adminController');
const { getStudentStats } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Categories (public/protected)
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);
router.delete('/categories/:id', protect, authorize('admin'), deleteCategory);

// Student stats route helper
router.get('/student-stats', protect, getStudentStats);

// Admin exclusive routes
router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id', protect, authorize('admin'), updateUserByAdmin);
router.delete('/users/:id', protect, authorize('admin'), deleteUserByAdmin);

module.exports = router;
