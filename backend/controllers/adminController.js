const User = require('../models/User');
const Course = require('../models/Course');
const Category = require('../models/Category');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');

// @desc    Get admin high-level platform stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    // Total revenue calculation
    const courses = await Course.find();
    const totalRevenue = courses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrollmentCount || 0)), 0);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(6).select('-password');
    const recentCourses = await Course.find().populate('instructorId', 'firstName lastName fullName').sort({ createdAt: -1 }).limit(6);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        instructorCount,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalCertificates,
        totalRevenue
      },
      recentUsers,
      recentCourses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (with search and role filters)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }
    if (status) {
      query.isActive = status === 'active';
    }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 }).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / role (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUserByAdmin = async (req, res, next) => {
  try {
    const { role, isActive, firstName, lastName, title } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (title !== undefined) user.title = title;

    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Public / Private
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, color } = req.body;

    const category = await Category.create({
      name,
      description: description || '',
      icon: icon || 'BookOpen',
      color: color || 'from-indigo-500 to-purple-600'
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Category deleted'
    });
  } catch (error) {
    next(error);
  }
};
