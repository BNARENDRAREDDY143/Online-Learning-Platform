const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  },
  title: {
    type: String,
    required: [true, 'Please provide assignment title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide assignment description']
  },
  instructions: {
    type: String,
    default: ''
  },
  dueDate: {
    type: Date
  },
  submissionType: {
    type: String,
    enum: ['text', 'file', 'url', 'all'],
    default: 'all'
  },
  maxPoints: {
    type: Number,
    default: 100
  },
  attachments: [{
    title: String,
    url: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
