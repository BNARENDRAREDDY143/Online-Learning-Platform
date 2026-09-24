const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// @desc    Add lesson to section
// @route   POST /api/sections/:sectionId/lessons
// @access  Private (Instructor/Admin)
exports.createLesson = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const { title, description, type, content, durationMinutes, isFreePreview, order, resources } = req.body;

    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const course = await Course.findById(section.courseId);
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const lessonCount = section.lessons.length;
    const lesson = await Lesson.create({
      sectionId,
      courseId: course._id,
      title,
      description: description || '',
      type: type || 'video',
      content: content || {},
      durationMinutes: Number(durationMinutes) || 10,
      isFreePreview: !!isFreePreview,
      order: order !== undefined ? order : lessonCount + 1,
      resources: resources || []
    });

    section.lessons.push(lesson._id);
    await section.save();

    res.status(201).json({
      success: true,
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private / Public preview
exports.getLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    res.status(200).json({
      success: true,
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Instructor/Admin)
exports.updateLesson = async (req, res, next) => {
  try {
    let lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const course = await Course.findById(lesson.courseId);
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Instructor/Admin)
exports.deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const course = await Course.findById(lesson.courseId);
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Section.findByIdAndUpdate(lesson.sectionId, {
      $pull: { lessons: lesson._id }
    });

    await lesson.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lesson removed'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark lesson as completed for student
// @route   POST /api/lessons/:id/complete
// @access  Private (Student)
exports.completeLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    let enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId: lesson.courseId
    });

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
    }

    // Add to completedLessons if not already present
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }
    enrollment.lastAccessedLesson = lessonId;

    // Calculate total lessons in course
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    const progress = totalLessons > 0 ? Math.min(100, Math.round((enrollment.completedLessons.length / totalLessons) * 100)) : 100;
    
    enrollment.progressPercent = progress;
    if (progress >= 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = Date.now();
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      progressPercent: enrollment.progressPercent,
      completedLessons: enrollment.completedLessons,
      status: enrollment.status
    });
  } catch (error) {
    next(error);
  }
};
