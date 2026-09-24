const Course = require('../models/Course');
const Section = require('../models/Section');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Category = require('../models/Category');

// @desc    Get all published courses with search, filters, pagination
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res, next) => {
  try {
    const { search, category, level, price, sort, page = 1, limit = 12 } = req.query;

    const query = { status: 'published' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: category, $options: 'i' };
    }

    if (level && level !== 'all') {
      query.level = level;
    }

    if (price === 'free') {
      query.price = 0;
    } else if (price === 'paid') {
      query.price = { $gt: 0 };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { enrollmentCount: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('instructorId', 'firstName lastName fullName profilePicture title')
      .populate({
        path: 'sections',
        populate: { path: 'lessons', select: 'title durationMinutes isFreePreview type' }
      })
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course by ID or slug
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    const query = isObjectId ? { _id: id } : { slug: id };

    const course = await Course.findOne(query)
      .populate('instructorId', 'firstName lastName fullName profilePicture title bio expertise')
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

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course (Instructor / Admin)
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res, next) => {
  try {
    const {
      title,
      subtitle,
      description,
      category,
      subcategory,
      level,
      price,
      discount,
      durationHours,
      objectives,
      requirements,
      thumbnail,
      previewVideoUrl,
      status
    } = req.body;

    const course = await Course.create({
      title,
      subtitle,
      description,
      category: category || 'Development',
      subcategory: subcategory || 'Web Development',
      level: level || 'beginner',
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      durationHours: Number(durationHours) || 10,
      objectives: Array.isArray(objectives) ? objectives : (objectives ? objectives.split('\n').filter(Boolean) : []),
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter(Boolean) : []),
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      previewVideoUrl: previewVideoUrl || '',
      status: status || 'draft',
      instructorId: req.user.id
    });

    // Create a default intro section
    const defaultSection = await Section.create({
      courseId: course._id,
      title: '1. Course Orientation & Getting Started',
      description: 'Introduction to course structure and tools',
      order: 1
    });

    const defaultLesson = await Lesson.create({
      courseId: course._id,
      sectionId: defaultSection._id,
      title: 'Welcome to the Course',
      type: 'video',
      order: 1,
      isFreePreview: true,
      durationMinutes: 5,
      content: {
        videoUrl: previewVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        articleBody: 'Welcome aboard! In this course you will master all essential skills step by step.'
      }
    });

    defaultSection.lessons.push(defaultLesson._id);
    await defaultSection.save();

    course.sections.push(defaultSection._id);
    await course.save();

    res.status(201).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor owner or Admin)
exports.updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check ownership
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('instructorId', 'firstName lastName fullName profilePicture');

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor owner or Admin)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }

    // Clean up sections & lessons
    await Lesson.deleteMany({ courseId: course._id });
    await Section.deleteMany({ courseId: course._id });
    await Enrollment.deleteMany({ courseId: course._id });
    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course and related content removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor courses
// @route   GET /api/courses/instructor/my-courses
// @access  Private (Instructor/Admin)
exports.getInstructorCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructorId: req.user.id })
      .populate('sections')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instructor analytics overview
// @route   GET /api/courses/instructor/analytics
// @access  Private (Instructor/Admin)
exports.getInstructorAnalytics = async (req, res, next) => {
  try {
    const courses = await Course.find({ instructorId: req.user.id });
    const courseIds = courses.map(c => c._id);

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'firstName lastName fullName email profilePicture')
      .populate('courseId', 'title thumbnail price');

    const totalStudents = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const completionRate = totalStudents ? Math.round((completedEnrollments / totalStudents) * 100) : 0;

    const totalRevenue = courses.reduce((acc, c) => acc + (c.price * (c.enrollmentCount || 0)), 0);
    const avgRating = courses.length ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1) : '5.0';

    res.status(200).json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents,
        completionRate,
        totalRevenue,
        avgRating
      },
      recentEnrollments: enrollments.slice(0, 10),
      courses
    });
  } catch (error) {
    next(error);
  }
};
