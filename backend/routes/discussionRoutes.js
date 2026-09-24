const express = require('express');
const router = express.Router();
const {
  getCourseDiscussions,
  createDiscussion,
  replyDiscussion,
  toggleLike
} = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/course/:courseId', protect, getCourseDiscussions);
router.post('/course/:courseId', protect, createDiscussion);
router.post('/:id/reply', protect, replyDiscussion);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
