import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define the Quiz schema
const quizResponseSchema = new mongoose.Schema({
  questionId: String,
  question: String,
  userAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean
});

const quizSchema = new mongoose.Schema({
  userId: String,
  courseId: String,
  moduleIndex: Number,
  moduleTitle: String,
  lessonTitle: String,
  questions: [{
    id: String,
    question: String,
    options: [String],
    correctAnswer: String
  }],
  responses: [quizResponseSchema],
  score: Number,
  totalQuestions: Number,
  completed: Boolean
}, { timestamps: true });

// Create the model
const Quiz = mongoose.model('Quiz', quizSchema);

// Function to query the database
async function checkQuizesInDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Count all quizzes
    const quizCount = await Quiz.countDocuments();
    console.log(`\nTotal quizzes in database: ${quizCount}`);

    // Get all quizzes
    const quizzes = await Quiz.find().sort({ createdAt: -1 }).limit(5);
    
    console.log('\nMost recent quizzes:');
    quizzes.forEach((quiz, index) => {
      console.log(`\n${index + 1}. Quiz ID: ${quiz._id}`);
      console.log(`   Title: ${quiz.moduleTitle} - ${quiz.lessonTitle}`);
      console.log(`   Created: ${quiz.createdAt}`);
      console.log(`   Questions: ${quiz.totalQuestions}`);
      console.log(`   Completed: ${quiz.completed ? 'Yes' : 'No'}`);
      if (quiz.completed) {
        console.log(`   Score: ${quiz.score}/${quiz.totalQuestions} (${Math.round((quiz.score / quiz.totalQuestions) * 100)}%)`);
      }
    });

    // Check completed quizzes
    const completedQuizzes = await Quiz.find({ completed: true });
    console.log(`\nCompleted quizzes: ${completedQuizzes.length}`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error checking quizzes:', error);
  }
}

// Run the function
checkQuizesInDatabase(); 