const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    originalName: String, // From Google Sheets "Course Name"
    emoji: { type: String, default: '📚' },
    isActive: { type: Boolean, default: true },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    instructor: {
      type: String,
      required: true,
    },
    programName: String,
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    curriculum: [
      {
        sectionTitle: String,
        lectures: [
          {
            title: String,
            duration: String,
            videoUrl: String,
          },
        ],
      },
    ],
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    studentsCount: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    availableSeats: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
