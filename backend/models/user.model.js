import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    completedQuizzes: [{
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz"
      },
      courseId: String,
      moduleIndex: Number,
      score: Number,
      percentage: Number,
      completedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
