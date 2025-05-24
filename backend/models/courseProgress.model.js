import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: String,
    required: true
  },
  lessonTitle: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

const moduleProgressSchema = new mongoose.Schema({
  moduleIndex: {
    type: Number,
    required: true
  },
  moduleTitle: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  lessons: [lessonProgressSchema]
});

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    courseId: {
      type: String,
      required: true
    },
    courseTitle: {
      type: String,
      required: true
    },
    instructor: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      default: 0
    },
    modules: [moduleProgressSchema],
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Create compound index for userId and courseId
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

export default CourseProgress; 