const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Course = require('../models/Course');
const Section = require('../models/Section');

// @desc    Create assignment
// @route   POST /api/courses/:courseId/assignments
// @access  Private (Instructor/Admin)
exports.createAssignment = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { sectionId, title, description, instructions, dueDate, submissionType, maxPoints } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const assignment = await Assignment.create({
      courseId,
      sectionId: sectionId || null,
      title,
      description,
      instructions: instructions || '',
      dueDate: dueDate || null,
      submissionType: submissionType || 'all',
      maxPoints: Number(maxPoints) || 100
    });

    if (sectionId) {
      await Section.findByIdAndUpdate(sectionId, { assignmentId: assignment._id });
    }

    res.status(201).json({
      success: true,
      assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment and current student submission
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let submission = null;
    if (req.user.role === 'student') {
      submission = await AssignmentSubmission.findOne({
        assignmentId: assignment._id,
        studentId: req.user.id
      }).populate('gradedBy', 'firstName lastName fullName');
    }

    res.status(200).json({
      success: true,
      assignment,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment (Student)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
exports.submitAssignment = async (req, res, next) => {
  try {
    const assignmentId = req.params.id;
    const { content, projectUrl, fileUrl, notes, submissionType } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let submission = await AssignmentSubmission.findOne({
      assignmentId,
      studentId: req.user.id
    });

    if (submission) {
      submission.content = content || submission.content;
      submission.projectUrl = projectUrl || submission.projectUrl;
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.notes = notes || submission.notes;
      submission.submissionType = submissionType || submission.submissionType;
      submission.status = 'submitted';
      submission.submittedAt = Date.now();
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId,
        courseId: assignment.courseId,
        studentId: req.user.id,
        submissionType: submissionType || 'text',
        content: content || '',
        projectUrl: projectUrl || '',
        fileUrl: fileUrl || '',
        notes: notes || '',
        status: 'submitted'
      });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get submissions for an assignment or instructor's courses
// @route   GET /api/assignments/instructor/submissions
// @access  Private (Instructor/Admin)
exports.getInstructorSubmissions = async (req, res, next) => {
  try {
    const { courseId, status } = req.query;
    
    let courseFilter = {};
    if (req.user.role !== 'admin') {
      const instructorCourses = await Course.find({ instructorId: req.user.id }).select('_id');
      const courseIds = instructorCourses.map(c => c._id);
      courseFilter.courseId = { $in: courseIds };
    }

    if (courseId) {
      courseFilter.courseId = courseId;
    }
    if (status) {
      courseFilter.status = status;
    }

    const submissions = await AssignmentSubmission.find(courseFilter)
      .populate('studentId', 'firstName lastName fullName email profilePicture')
      .populate('assignmentId', 'title maxPoints')
      .populate('courseId', 'title thumbnail')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade student submission (Instructor)
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Private (Instructor/Admin)
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate('assignmentId')
      .populate('courseId');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.grade = Number(grade);
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = req.user.id;
    submission.gradedAt = Date.now();

    await submission.save();

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    next(error);
  }
};
