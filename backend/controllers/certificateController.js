const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Generate Certificate upon course completion
// @route   POST /api/certificates/generate/:courseId
// @access  Private (Student)
exports.generateCertificate = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('instructorId');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user.id,
      courseId
    });

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'You are not enrolled in this course' });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      studentId: req.user.id,
      courseId
    });

    if (certificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already generated',
        certificate
      });
    }

    // Generate unique Certificate Number: CERT-YYYY-[6 random chars]
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certNum = `CERT-${new Date().getFullYear()}-${randomHex}`;

    const student = await User.findById(req.user.id);
    const studentName = `${student.firstName} ${student.lastName}`.trim();
    const instructorName = course.instructorId ? `${course.instructorId.firstName} ${course.instructorId.lastName}` : 'Senior Course Instructor';

    certificate = await Certificate.create({
      certificateNumber: certNum,
      studentId: req.user.id,
      courseId: course._id,
      studentName,
      courseTitle: course.title,
      instructorName,
      gradePercent: 100,
      honorLevel: 'Honors',
      issueDate: new Date(),
      isVerified: true
    });

    enrollment.certificateIssued = true;
    enrollment.certificateId = certificate._id;
    enrollment.status = 'completed';
    enrollment.progressPercent = 100;
    enrollment.completedAt = new Date();
    await enrollment.save();

    res.status(201).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's certificates
// @route   GET /api/certificates
// @access  Private
exports.getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ studentId: req.user.id })
      .populate('courseId', 'title thumbnail category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public verification of certificate by certificate number
// @route   GET /api/certificates/verify/:certNumber
// @access  Public
exports.verifyCertificate = async (req, res, next) => {
  try {
    const { certNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber: certNumber.toUpperCase() })
      .populate('courseId', 'title description category level durationHours')
      .populate('studentId', 'firstName lastName profilePicture');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'No certificate found with this verification ID. Please check the code.'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        instructorName: certificate.instructorName,
        honorLevel: certificate.honorLevel,
        gradePercent: certificate.gradePercent,
        issueDate: certificate.issueDate,
        isVerified: certificate.isVerified,
        course: certificate.courseId
      }
    });
  } catch (error) {
    next(error);
  }
};
