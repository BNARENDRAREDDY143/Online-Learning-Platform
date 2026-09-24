const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateNumber: {
    type: String,
    unique: true,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  gradePercent: {
    type: Number,
    default: 100
  },
  honorLevel: {
    type: String,
    enum: ['Honors', 'Distinction', 'Standard Completion'],
    default: 'Standard Completion'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  qrCodeData: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
