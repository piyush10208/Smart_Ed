import mongoose from "mongoose";

const quizResponseSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
});

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    moduleIndex: {
      type: Number,
      required: true,
    },
    moduleTitle: {
      type: String,
      required: true,
    },
    lessonTitle: {
      type: String,
      required: true,
    },
    questions: [{
      id: String,
      question: String,
      options: [String],
      correctAnswer: String
    }],
    responses: [quizResponseSchema],
    score: {
      type: Number,
      default: 0
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz; 