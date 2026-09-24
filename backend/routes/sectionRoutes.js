const express = require('express');
const router = express.Router({ mergeParams: true });
const { createSection, updateSection, deleteSection } = require('../controllers/sectionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('instructor', 'admin'), createSection);
router.put('/:id', protect, authorize('instructor', 'admin'), updateSection);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteSection);

module.exports = router;
