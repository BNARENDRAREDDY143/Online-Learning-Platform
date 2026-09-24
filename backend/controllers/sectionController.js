const Section = require('../models/Section');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// @desc    Add section to course
// @route   POST /api/courses/:courseId/sections
// @access  Private (Instructor/Admin)
exports.createSection = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this course' });
    }

    const currentSectionsCount = course.sections.length;
    const section = await Section.create({
      courseId,
      title,
      description: description || '',
      order: order !== undefined ? order : currentSectionsCount + 1
    });

    course.sections.push(section._id);
    await course.save();

    res.status(201).json({
      success: true,
      section
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update section
// @route   PUT /api/sections/:id
// @access  Private (Instructor/Admin)
exports.updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;

    let section = await Section.findById(id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const course = await Course.findById(section.courseId);
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    section.title = title || section.title;
    if (description !== undefined) section.description = description;
    if (order !== undefined) section.order = order;
    await section.save();

    res.status(200).json({
      success: true,
      section
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete section
// @route   DELETE /api/sections/:id
// @access  Private (Instructor/Admin)
exports.deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const course = await Course.findById(section.courseId);
    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete lessons inside section
    await Lesson.deleteMany({ sectionId: section._id });
    
    // Remove section from course array
    course.sections = course.sections.filter(sId => sId.toString() !== id);
    await course.save();

    await section.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Section and contained lessons removed'
    });
  } catch (error) {
    next(error);
  }
};
