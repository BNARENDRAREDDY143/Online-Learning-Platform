const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide lesson title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['video', 'document', 'article', 'presentation'],
    default: 'video'
  },
  order: {
    type: Number,
    default: 0
  },
  content: {
    videoUrl: { type: String, default: '' },
    documentUrl: { type: String, default: '' },
    articleBody: { type: String, default: '' },
    transcript: { type: String, default: '' }
  },
  durationMinutes: {
    type: Number,
    default: 10
  },
  isFreePreview: {
    type: Boolean,
    default: false
  },
  resources: [{
    title: { type: String },
    url: { type: String },
    type: { type: String, default: 'pdf' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
