const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Certificate = require('../models/Certificate');

// @desc    Enroll in a course
// @route   POST /api/courses/:courseId/enroll
// @access  Private (Student)
exports.enrollCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate({
      path: 'sections',
      populate: { path: 'lessons' }
    });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    });

    if (enrollment) {
      return res.status(200).json({
        success: true,
        message: 'Already enrolled in this course',
        enrollment
      });
    }

    // Find first lesson for initial bookmark
    let firstLessonId = null;
    if (course.sections.length > 0 && course.sections[0].lessons.length > 0) {
      firstLessonId = course.sections[0].lessons[0]._id;
    }

    enrollment = await Enrollment.create({
      studentId: req.user.id,
      courseId,
      lastAccessedLesson: firstLessonId,
      progressPercent: 0
    });

    // Increment course enrollment count
    course.enrollmentCount = (course.enrollmentCount || 0) + 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's enrolled courses (My Learning)
// @route   GET /api/courses/my-learning
// @access  Private (Student)
exports.getMyLearning = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id })
      .populate({
        path: 'courseId',
        populate: [
          { path: 'instructorId', select: 'firstName lastName fullName profilePicture' },
          { path: 'sections', populate: { path: 'lessons', select: 'title durationMinutes' } }
        ]
      })
      .populate('certificateId')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student learning room course details + progress
// @route   GET /api/courses/:courseId/learn
// @access  Private (Student/Instructor/Admin)
exports.getCourseLearningData = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('instructorId', 'firstName lastName fullName profilePicture title bio')
      .populate({
        path: 'sections',
        options: { sort: { order: 1 } },
        populate: [
          { path: 'lessons', options: { sort: { order: 1 } } },
          { path: 'quizId' },
          { path: 'assignmentId' }
        ]
      });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    }).populate('certificateId');

    // Auto-enroll if not enrolled yet for smooth demo/testing
    if (!enrollment && req.user.role === 'student') {
      let firstLesson = course.sections[0]?.lessons[0]?._id;
      enrollment = await Enrollment.create({
        studentId: req.user.id,
        courseId,
        lastAccessedLesson: firstLesson,
        progressPercent: 0
      });
      course.enrollmentCount = (course.enrollmentCount || 0) + 1;
      await course.save();
    }

    res.status(200).json({
      success: true,
      course,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student overall stats (Dashboard)
// @route   GET /api/students/stats
// @access  Private (Student)
exports.getStudentStats = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user.id })
      .populate('courseId', 'title thumbnail durationHours category');

    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(e => e.status === 'completed' || e.progressPercent === 100);
    const inProgressCourses = enrollments.filter(e => e.status !== 'completed' && e.progressPercent < 100);

    const totalHoursSpent = enrollments.reduce((sum, e) => sum + (e.totalTimeSpentSeconds || 0), 0) / 3600;
    const certificatesCount = await Certificate.countDocuments({ studentId: req.user.id });

    res.status(200).json({
      success: true,
      stats: {
        totalEnrolled,
        completedCount: completedCourses.length,
        inProgressCount: inProgressCourses.length,
        certificatesCount,
        hoursLearned: Math.max(1, Math.round(totalHoursSpent * 10) / 10),
        streakDays: req.user.streakDays || 5
      },
      inProgressCourses: inProgressCourses.slice(0, 4),
      completedCourses
    });
  } catch (error) {
    next(error);
  }
};
