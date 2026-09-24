const Discussion = require('../models/Discussion');
const Course = require('../models/Course');

// @desc    Get course discussions
// @route   GET /api/courses/:courseId/discussions
// @access  Private
exports.getCourseDiscussions = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { category, search } = req.query;

    const query = { courseId };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const discussions = await Discussion.find(query)
      .populate('userId', 'firstName lastName fullName profilePicture role')
      .populate('replies.userId', 'firstName lastName fullName profilePicture role title')
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: discussions.length,
      discussions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create discussion thread
// @route   POST /api/courses/:courseId/discussions
// @access  Private
exports.createDiscussion = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, content, category, lessonId } = req.body;

    const discussion = await Discussion.create({
      courseId,
      lessonId: lessonId || null,
      userId: req.user.id,
      title,
      content,
      category: category || 'Question'
    });

    const populated = await Discussion.findById(discussion._id)
      .populate('userId', 'firstName lastName fullName profilePicture role');

    res.status(201).json({
      success: true,
      discussion: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reply to discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
exports.replyDiscussion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const isInstructor = req.user.role === 'instructor' || req.user.role === 'admin';

    discussion.replies.push({
      userId: req.user.id,
      content,
      isInstructorAnswer: isInstructor,
      isAcceptedSolution: false
    });

    await discussion.save();

    const updated = await Discussion.findById(id)
      .populate('userId', 'firstName lastName fullName profilePicture role')
      .populate('replies.userId', 'firstName lastName fullName profilePicture role title');

    res.status(200).json({
      success: true,
      discussion: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle upvote / like
// @route   POST /api/discussions/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const index = discussion.likes.indexOf(req.user.id);
    if (index > -1) {
      discussion.likes.splice(index, 1);
    } else {
      discussion.likes.push(req.user.id);
    }

    await discussion.save();

    res.status(200).json({
      success: true,
      likesCount: discussion.likes.length,
      hasLiked: index === -1
    });
  } catch (error) {
    next(error);
  }
};
