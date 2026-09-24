const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
    maxlength: [150, 'Course title cannot be more than 150 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  subtitle: {
    type: String,
    default: '',
    maxlength: [250, 'Subtitle cannot exceed 250 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide course description']
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    default: 'Development'
  },
  subcategory: {
    type: String,
    default: 'Web Development'
  },
  tags: [{
    type: String
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all_levels'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'English'
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  },
  previewVideoUrl: {
    type: String,
    default: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  price: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0 // percentage
  },
  durationHours: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  objectives: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 4.8,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseSchema.pre('save', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
