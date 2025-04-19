import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";
import axios from "axios";

// Generate a quiz using OpenAI API
export const generateQuiz = async (req, res) => {
  try {
    console.log("Received request to generate quiz:", req.body);
    const { courseId, moduleIndex, moduleTitle, lessonTitle } = req.body;
    
    if (!courseId || moduleIndex === undefined || !moduleTitle || !lessonTitle) {
      console.log("Missing required fields:", { courseId, moduleIndex, moduleTitle, lessonTitle });
      return res.status(400).json({ message: "All fields are required" });
    }

    const userId = req.user._id;
    console.log("User ID:", userId);

    // Check if a quiz already exists for this user, course, module and lesson
    const existingQuiz = await Quiz.findOne({
      userId,
      courseId,
      moduleIndex,
      lessonTitle
    });

    if (existingQuiz && !req.query.regenerate) {
      return res.status(200).json(existingQuiz);
    }

    let quizData;
    
    try {
      // Generate new quiz using OpenAI API
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const prompt = `Generate a multiple-choice quiz about ${moduleTitle}, specifically focused on the lesson "${lessonTitle}". 
      Create 5 questions with 4 options each. Return the response in the following JSON format:
      {
        "questions": [
          {
            "id": "q1",
            "question": "Question text here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Correct option text"
          }
        ]
      }
      Ensure the correctAnswer exactly matches one of the options.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful education assistant that creates quizzes." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      // Parse the response
      const content = response.data.choices[0].message.content;
      quizData = JSON.parse(content);
      
    } catch (error) {
      console.error("Error with OpenAI API, using mock data instead:", error.message);
      
      // Generate mock quiz data if OpenAI fails
      quizData = {
        questions: [
          {
            id: "q1",
            question: `What is the main focus of ${moduleTitle}?`,
            options: [
              `Understanding ${moduleTitle} concepts`,
              `Practical applications of ${moduleTitle}`,
              `History of ${moduleTitle}`,
              `Advanced ${moduleTitle} techniques`
            ],
            correctAnswer: `Understanding ${moduleTitle} concepts`
          },
          {
            id: "q2",
            question: `Which of the following is NOT typically covered in ${lessonTitle}?`,
            options: [
              "Fundamental principles",
              "Practical exercises",
              "Advanced algorithms",
              "Basic terminology"
            ],
            correctAnswer: "Advanced algorithms"
          },
          {
            id: "q3",
            question: "Which learning approach is most effective for this subject?",
            options: [
              "Hands-on practice",
              "Theoretical study",
              "Group discussions",
              "Self-paced learning"
            ],
            correctAnswer: "Hands-on practice"
          },
          {
            id: "q4",
            question: "What skill is most important for mastering this subject?",
            options: [
              "Critical thinking",
              "Memorization",
              "Mathematical ability",
              "Communication skills"
            ],
            correctAnswer: "Critical thinking"
          },
          {
            id: "q5",
            question: "How does this lesson relate to real-world applications?",
            options: [
              "Directly applicable to industry problems",
              "Mostly theoretical with few applications",
              "Foundational for advanced topics",
              "Important for specific certifications"
            ],
            correctAnswer: "Directly applicable to industry problems"
          }
        ]
      };
    }

    // Create or update the quiz
    let quiz;
    
    if (existingQuiz && req.query.regenerate) {
      // Update the existing quiz with new questions
      existingQuiz.questions = quizData.questions;
      existingQuiz.totalQuestions = quizData.questions.length;
      existingQuiz.responses = []; // Clear previous responses
      existingQuiz.score = 0;
      existingQuiz.completed = false;
      
      quiz = await existingQuiz.save();
    } else {
      // Create a new quiz
      quiz = new Quiz({
        userId,
        courseId,
        moduleIndex,
        moduleTitle,
        lessonTitle,
        questions: quizData.questions,
        totalQuestions: quizData.questions.length
      });
      
      quiz = await quiz.save();
    }

    // Return the quiz without the correct answers
    const sanitizedQuiz = {
      _id: quiz._id,
      courseId: quiz.courseId,
      moduleIndex: quiz.moduleIndex,
      moduleTitle: quiz.moduleTitle,
      lessonTitle: quiz.lessonTitle,
      questions: quiz.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options
      })),
      totalQuestions: quiz.totalQuestions,
      completed: quiz.completed
    };

    res.status(201).json(sanitizedQuiz);
  } catch (error) {
    console.error("Error in generateQuiz controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Submit quiz responses
export const submitQuizResponses = async (req, res) => {
  try {
    const { quizId, responses } = req.body;
    
    if (!quizId || !responses || !Array.isArray(responses)) {
      return res.status(400).json({ message: "Quiz ID and responses are required" });
    }

    const userId = req.user._id;

    // Find the quiz
    const quiz = await Quiz.findOne({ _id: quizId, userId });
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (quiz.completed) {
      return res.status(400).json({ message: "Quiz already completed" });
    }

    // Process the responses
    const quizResponses = [];
    let score = 0;

    for (const response of responses) {
      const { questionId, answer } = response;
      
      // Find the corresponding question
      const question = quiz.questions.find(q => q.id === questionId);
      
      if (!question) {
        continue;
      }

      const isCorrect = question.correctAnswer === answer;
      
      if (isCorrect) {
        score += 1;
      }

      quizResponses.push({
        questionId,
        question: question.question,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect
      });
    }

    // Update the quiz
    quiz.responses = quizResponses;
    quiz.score = score;
    quiz.completed = true;
    
    await quiz.save();
    
    // Calculate percentage
    const percentage = Math.round((score / quiz.totalQuestions) * 100);
    
    // Update user's completed quizzes
    await User.findByIdAndUpdate(userId, {
      $push: {
        completedQuizzes: {
          quizId: quiz._id,
          courseId: quiz.courseId,
          moduleIndex: quiz.moduleIndex,
          score,
          percentage
        }
      }
    });

    res.status(200).json({
      _id: quiz._id,
      score,
      totalQuestions: quiz.totalQuestions,
      percentage,
      responses: quizResponses
    });
  } catch (error) {
    console.error("Error in submitQuizResponses controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get quiz results
export const getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const quiz = await Quiz.findOne({ _id: quizId, userId });
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    if (!quiz.completed) {
      return res.status(400).json({ message: "Quiz not completed yet" });
    }

    res.status(200).json({
      _id: quiz._id,
      score: quiz.score,
      totalQuestions: quiz.totalQuestions,
      percentage: Math.round((quiz.score / quiz.totalQuestions) * 100),
      responses: quiz.responses,
      moduleTitle: quiz.moduleTitle,
      lessonTitle: quiz.lessonTitle
    });
  } catch (error) {
    console.error("Error in getQuizResults controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}; 