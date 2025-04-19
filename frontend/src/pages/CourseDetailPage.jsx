import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import useCourseStore from "../store/useCourseStore";
import { BookOpen, Clock, Users, Star, Play, Check, List, ArrowLeft, FileText, X, Award } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Quiz Modal Component
const QuizModal = ({ lesson, module, courseId, moduleIndex, onClose, onProgressUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [error, setError] = useState(null);
  const { authUser } = useAuthStore();

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    console.log("Fetching quiz for:", {
      courseId,
      moduleIndex,
      moduleTitle: module.title,
      lessonTitle: lesson.title
    });
    
    try {
      // Log the full request URL for debugging
      console.log("Sending request to:", `${axiosInstance.defaults.baseURL}/quiz/dev/generate`);
      
      // Add a unique timestamp to prevent getting a cached or completed quiz
      const timestamp = new Date().getTime();
      const uniqueCourseId = `${courseId}-${timestamp}`;
      
      // Use the development route that doesn't require authentication
      const response = await axiosInstance.post("/quiz/dev/generate", {
        courseId: uniqueCourseId,
        moduleIndex,
        moduleTitle: module.title,
        lessonTitle: lesson.title
      });
      
      // Validate response data
      if (!response.data || !response.data._id || !response.data.questions) {
        console.error("Invalid quiz data received:", response.data);
        throw new Error("Received invalid quiz data from server");
      }
      
      console.log("Quiz generated successfully:", response.data);
      setQuiz(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        setError(`Failed to load quiz: ${error.response.data.message || "Server error"}`);
      } else if (error.request) {
        console.error("Error request:", error.request);
        setError("Failed to load quiz: No response from server - check if backend is running");
      } else {
        console.error("Error message:", error.message);
        setError(`Failed to load quiz: ${error.message}`);
      }
      setLoading(false);
      toast.error("Failed to load quiz");
    }
  };

  const handleSelectAnswer = (questionId, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      toast.error("Please answer all questions before submitting");
      return;
    }

    setLoading(true);
    try {
      // Format responses
      const responses = Object.entries(selectedAnswers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      console.log("Submitting quiz responses:", {
        quizId: quiz._id,
        responses
      });

      // Ensure we have a valid quiz ID
      if (!quiz._id) {
        console.error("Quiz ID is missing in the quiz object:", quiz);
        throw new Error("Quiz ID is missing");
      }

      // Make sure we have valid responses
      if (responses.length === 0) {
        throw new Error("No responses to submit");
      }
      
      // Log the full request details for debugging
      console.log("Sending request to:", `${axiosInstance.defaults.baseURL}/quiz/dev/submit`);
      console.log("Request payload:", { quizId: quiz._id, responses });

      const response = await axiosInstance.post("/quiz/dev/submit", {
        quizId: quiz._id,
        responses
      });

      console.log("Quiz submission successful:", response.data);
      setQuizResults(response.data);
      setQuizSubmitted(true);
      setLoading(false);
      
      // Calculate the percentage of correct answers
      const scorePercentage = (response.data.score / response.data.totalQuestions) * 100;
      
      // Update the course progress based on quiz completion
      // Each quiz contributes between 5% and 15% to course progress depending on score
      const progressIncrease = Math.max(5, Math.round(scorePercentage * 0.15));
      
      // Call the onProgressUpdate function to update the course progress
      onProgressUpdate(progressIncrease);
      
      toast.success("Quiz completed successfully!");
    } catch (error) {
      console.error("Error submitting quiz:", error);
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        
        // Handle the "Quiz already completed" error specifically
        if (error.response.data.message === "Quiz already completed") {
          // Try to fetch the quiz results if it's already completed
          try {
            const resultResponse = await axiosInstance.get(`/quiz/dev/results/${quiz._id}`);
            setQuizResults(resultResponse.data);
            setQuizSubmitted(true);
            toast.info("This quiz was already completed. Showing your previous results.");
          } catch (resultError) {
            // If we can't retrieve the results, show a simple message
            toast.error("This quiz has already been completed. Please try a different one.");
            onClose(); // Close the quiz modal
          }
        } else {
          // Handle other error messages
          toast.error(`Failed to submit quiz: ${error.response.data.message || "Server error"}`);
        }
      } else if (error.request) {
        console.error("Error request:", error.request);
        toast.error("Failed to submit quiz: No response from server - check if backend is running");
      } else {
        console.error("Error message:", error.message);
        toast.error(`Failed to submit quiz: ${error.message}`);
      }
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-error";
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-base-100 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
          <div className="flex justify-center items-center h-40">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-base-100 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
          <button 
            className="absolute top-4 right-4 btn btn-sm btn-ghost"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
          <div className="text-center py-8">
            <div className="text-error mb-4">
              <X className="size-10 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-2">Error Loading Quiz</h3>
            <p className="mb-4">{error}</p>
            <button 
              className="btn btn-primary"
              onClick={fetchQuiz}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizSubmitted && quizResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-base-100 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
          <button 
            className="absolute top-4 right-4 btn btn-sm btn-ghost"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="size-20 rounded-full bg-base-200 flex items-center justify-center">
                <Award className="size-10 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Quiz Results</h2>
            <p className="text-base-content/70 mb-2">{module.title}: {lesson.title}</p>
            <div className="stats shadow mx-auto mt-4">
              <div className="stat">
                <div className="stat-title">Score</div>
                <div className={`stat-value ${getScoreColor(quizResults.percentage)}`}>
                  {quizResults.score}/{quizResults.totalQuestions}
                </div>
                <div className="stat-desc">{quizResults.percentage}% correct</div>
              </div>
            </div>
          </div>
          
          <div className="divider">Answers</div>
          
          <div className="space-y-6">
            {quizResults.responses.map((response, index) => (
              <div key={response.questionId} className="bg-base-200 p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-base-100 text-base-content size-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="font-medium">{response.question}</div>
                </div>
                <div className="pl-9">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`font-medium ${response.isCorrect ? 'text-success' : 'text-error'}`}>
                      Your answer: {response.userAnswer}
                    </div>
                    {response.isCorrect ? 
                      <Check className="size-5 text-success" /> : 
                      <X className="size-5 text-error" />
                    }
                  </div>
                  {!response.isCorrect && (
                    <div className="text-success font-medium">
                      Correct answer: {response.correctAnswer}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <button 
              className="btn btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestionData = quiz.questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          className="absolute top-4 right-4 btn btn-sm btn-ghost"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Quiz: {lesson.title}</h2>
          <p className="text-base-content/70">{module.title}</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="badge badge-neutral">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </div>
          <div className="text-sm">
            {Object.keys(selectedAnswers).length} of {quiz.questions.length} answered
          </div>
        </div>
        
        <div className="mb-8">
          <div className="font-medium text-lg mb-4">
            {currentQuestionData.question}
          </div>
          
          <div className="space-y-3">
            {currentQuestionData.options.map((option, index) => (
              <label 
                key={index} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedAnswers[currentQuestionData.id] === option 
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:bg-base-200'
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionData.id}`}
                  className="radio radio-primary"
                  checked={selectedAnswers[currentQuestionData.id] === option}
                  onChange={() => handleSelectAnswer(currentQuestionData.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between">
          <button 
            className="btn btn-outline"
            disabled={currentQuestion === 0}
            onClick={handlePrevQuestion}
          >
            Previous
          </button>
          
          {currentQuestion < quiz.questions.length - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={handleNextQuestion}
            >
              Next
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
              onClick={handleSubmitQuiz}
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Wikipedia Search Modal Component
const WikipediaModal = ({ searchTerm, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    searchWikipedia(searchTerm);
  }, [searchTerm]);

  const searchWikipedia = async (query) => {
    setLoading(true);
    
    const wikipediaURL = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=10&format=json&origin=*`;

    try {
      const response = await fetch(wikipediaURL);
      const data = await response.json();

      if (!data.query || !data.query.search) {
        throw new Error("No results found");
      }

      setResults(data.query.search);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Wikipedia data:", error);
      setError(error.message || 'Failed to fetch data. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-base-100 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          className="absolute top-4 right-4 btn btn-sm btn-ghost"
          onClick={onClose}
        >
          <X className="size-5" />
        </button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Wikipedia Results</h2>
          <p className="text-base-content/70">Search term: "{searchTerm}"</p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : error ? (
          <div className="text-center p-4 bg-error/20 rounded-lg">
            <p className="text-error">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {results.length === 0 ? (
              <div className="text-center py-8">
                <p>No results found for "{searchTerm}"</p>
              </div>
            ) : (
              results.map((result) => (
                <div key={result.pageid} className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="card-title">{result.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: result.snippet + "..." }} />
                    <div className="card-actions justify-end">
                      <a 
                        href={`https://en.wikipedia.org/?curid=${result.pageid}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Read More
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Mock course data
const courseData = {
  "1": {
    _id: "1",
    title: "Introduction to Computer Science",
    description: "Learn the fundamentals of computer science and programming with this comprehensive course designed for beginners. You'll explore algorithmic thinking, programming basics, and computer science principles that form the foundation for advanced studies.",
    instructor: "Dr. Alan Smith",
    instructorBio: "Professor of Computer Science at Stanford University with over 15 years of teaching experience. Dr. Smith specializes in algorithms and computational complexity.",
    category: "Computer Science",
    duration: "12 weeks",
    level: "Beginner",
    enrolledCount: 1240,
    rating: 4.8,
    createdAt: "2023-05-15",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    color: "bg-blue-500",
    prerequisites: ["Basic mathematics knowledge", "No prior programming experience required"],
    whatYouWillLearn: [
      "Fundamentals of programming in Python",
      "Algorithmic thinking and problem-solving",
      "Data structures and their implementations",
      "Computational complexity and algorithm analysis",
      "Introduction to software engineering principles"
    ],
    modules: [
      {
        title: "Getting Started with Programming",
        lessons: [
          { title: "Welcome to Computer Science", duration: "10 min", type: "video" },
          { title: "Setting Up Your Development Environment", duration: "15 min", type: "video" },
          { title: "Your First Program", duration: "25 min", type: "video" },
          { title: "Module 1 Quiz", duration: "15 min", type: "quiz" }
        ]
      },
      {
        title: "Programming Fundamentals",
        lessons: [
          { title: "Variables and Data Types", duration: "20 min", type: "video" },
          { title: "Control Flow: Conditionals", duration: "25 min", type: "video" },
          { title: "Control Flow: Loops", duration: "20 min", type: "video" },
          { title: "Programming Exercise 1", duration: "45 min", type: "exercise" },
          { title: "Module 2 Quiz", duration: "15 min", type: "quiz" }
        ]
      },
      {
        title: "Data Structures",
        lessons: [
          { title: "Introduction to Data Structures", duration: "15 min", type: "video" },
          { title: "Arrays and Lists", duration: "25 min", type: "video" },
          { title: "Dictionaries and Sets", duration: "20 min", type: "video" },
          { title: "Stacks and Queues", duration: "30 min", type: "video" },
          { title: "Data Structures Exercise", duration: "60 min", type: "exercise" },
          { title: "Module 3 Quiz", duration: "20 min", type: "quiz" }
        ]
      },
      {
        title: "Algorithms",
        lessons: [
          { title: "Introduction to Algorithms", duration: "20 min", type: "video" },
          { title: "Searching Algorithms", duration: "25 min", type: "video" },
          { title: "Sorting Algorithms", duration: "30 min", type: "video" },
          { title: "Algorithm Complexity", duration: "35 min", type: "video" },
          { title: "Algorithm Implementation Exercise", duration: "60 min", type: "exercise" },
          { title: "Final Quiz", duration: "30 min", type: "quiz" }
        ]
      }
    ]
  },
  "2": {
    _id: "2",
    title: "Advanced Mathematics",
    description: "Dive deep into advanced mathematical concepts including calculus, linear algebra, and statistics. This course is designed for students who want to strengthen their mathematical foundation for fields like engineering, data science, and computer science.",
    instructor: "Dr. Maria Johnson",
    instructorBio: "Mathematics Professor with a Ph.D. from MIT and over 10 years of experience teaching advanced mathematics. Dr. Johnson's research focuses on applied mathematics and mathematical modeling.",
    category: "Mathematics",
    duration: "16 weeks",
    level: "Advanced",
    enrolledCount: 876,
    rating: 4.7,
    createdAt: "2023-06-22",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
    color: "bg-purple-500",
    prerequisites: ["Calculus I", "Basic linear algebra", "Statistics fundamentals"],
    whatYouWillLearn: [
      "Advanced calculus concepts and applications",
      "Linear algebra and matrix operations",
      "Statistical analysis and inference",
      "Differential equations",
      "Mathematical modeling and optimization"
    ],
    modules: [
      {
        title: "Advanced Calculus",
        lessons: [
          { title: "Limits and Continuity", duration: "30 min", type: "video" },
          { title: "Derivatives and Applications", duration: "45 min", type: "video" },
          { title: "Integration Techniques", duration: "40 min", type: "video" },
          { title: "Multivariable Calculus", duration: "50 min", type: "video" },
          { title: "Calculus Exercise Set", duration: "75 min", type: "exercise" },
          { title: "Module 1 Quiz", duration: "25 min", type: "quiz" }
        ]
      },
      {
        title: "Linear Algebra",
        lessons: [
          { title: "Vectors and Vector Spaces", duration: "35 min", type: "video" },
          { title: "Matrices and Matrix Operations", duration: "40 min", type: "video" },
          { title: "Eigenvalues and Eigenvectors", duration: "45 min", type: "video" },
          { title: "Linear Transformations", duration: "35 min", type: "video" },
          { title: "Linear Algebra Exercise Set", duration: "60 min", type: "exercise" },
          { title: "Module 2 Quiz", duration: "20 min", type: "quiz" }
        ]
      }
    ]
  },
  "3": {
    _id: "3",
    title: "Physics Fundamentals",
    description: "Explore the laws of physics and their applications in this comprehensive course. From mechanics to thermodynamics, you'll gain a solid understanding of physical principles and learn to apply them to real-world problems.",
    instructor: "Prof. Robert Chen",
    instructorBio: "Physics Professor with a Ph.D. from Caltech and extensive research experience in theoretical physics. Prof. Chen has published numerous papers on quantum mechanics and has been teaching physics for over 20 years.",
    category: "Physics",
    duration: "10 weeks",
    level: "Intermediate",
    enrolledCount: 654,
    rating: 4.6,
    createdAt: "2023-07-10",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
    color: "bg-amber-500",
    prerequisites: ["Basic calculus", "Algebra", "Fundamental physics concepts"],
    whatYouWillLearn: [
      "Classical mechanics and Newton's laws",
      "Thermodynamics and heat transfer",
      "Wave mechanics and sound",
      "Electricity and magnetism",
      "Introduction to modern physics concepts"
    ],
    modules: [
      {
        title: "Classical Mechanics",
        lessons: [
          { title: "Introduction to Physics", duration: "20 min", type: "video" },
          { title: "Newton's Laws of Motion", duration: "35 min", type: "video" },
          { title: "Work, Energy, and Power", duration: "30 min", type: "video" },
          { title: "Momentum and Collisions", duration: "25 min", type: "video" },
          { title: "Mechanics Lab Exercise", duration: "60 min", type: "exercise" },
          { title: "Module 1 Quiz", duration: "20 min", type: "quiz" }
        ]
      },
      {
        title: "Thermodynamics",
        lessons: [
          { title: "Temperature and Heat", duration: "25 min", type: "video" },
          { title: "Laws of Thermodynamics", duration: "40 min", type: "video" },
          { title: "Heat Transfer", duration: "30 min", type: "video" },
          { title: "Thermodynamic Processes", duration: "35 min", type: "video" },
          { title: "Thermodynamics Lab Exercise", duration: "60 min", type: "exercise" },
          { title: "Module 2 Quiz", duration: "20 min", type: "quiz" }
        ]
      }
    ]
  },
  // Add new recommended courses
  "db101": {
    _id: "db101",
    title: "Advanced Database Design",
    description: "Master database design principles, normalization, query optimization, and advanced concepts for building high-performance data systems. Learn about different database types and when to use them for your applications.",
    instructor: "Dr. Maria Johnson",
    instructorBio: "Database expert with 15 years of experience in enterprise systems. Former lead architect at Oracle with a PhD in Computer Science.",
    category: "Computer Science",
    duration: "8 weeks",
    level: "Advanced",
    enrolledCount: 542,
    rating: 4.8,
    createdAt: "2023-08-15",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
    color: "bg-blue-700",
    prerequisites: ["Basic SQL knowledge", "Database fundamentals", "Some programming experience"],
    whatYouWillLearn: [
      "Database normalization and optimization techniques",
      "Advanced query design and performance tuning",
      "Transaction management and concurrency control",
      "NoSQL database concepts and implementation",
      "Database security best practices"
    ],
    modules: [
      {
        title: "Advanced Relational Database Concepts",
        lessons: [
          { title: "Normalization Deep Dive", duration: "30 min", type: "video" },
          { title: "Indexing Strategies", duration: "25 min", type: "video" },
          { title: "Query Optimization Techniques", duration: "40 min", type: "video" },
          { title: "Lab: Database Performance Tuning", duration: "60 min", type: "exercise" },
          { title: "Module Assessment", duration: "20 min", type: "quiz" }
        ]
      },
      {
        title: "NoSQL and Distributed Databases",
        lessons: [
          { title: "Introduction to NoSQL Systems", duration: "35 min", type: "video" },
          { title: "Document Databases: MongoDB", duration: "40 min", type: "video" },
          { title: "Key-Value Stores: Redis", duration: "30 min", type: "video" },
          { title: "Graph Databases: Neo4j", duration: "45 min", type: "video" },
          { title: "Lab: Building a Multi-Database System", duration: "90 min", type: "exercise" },
          { title: "Module Assessment", duration: "30 min", type: "quiz" }
        ]
      }
    ]
  },
  "react202": {
    _id: "react202",
    title: "React Framework Advanced",
    description: "Take your React skills to the next level with advanced patterns, state management techniques, performance optimization, and modern React ecosystem tools. Perfect for developers looking to build professional-grade applications.",
    instructor: "Alex Rodriguez",
    instructorBio: "Senior Frontend Developer with over 10 years of experience specializing in React applications. Former engineer at Facebook and technical author.",
    category: "Web Development",
    duration: "10 weeks",
    level: "Advanced",
    enrolledCount: 789,
    rating: 4.9,
    createdAt: "2023-09-10",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    color: "bg-purple-600",
    prerequisites: ["React basics", "JavaScript ES6+", "Some experience building React apps"],
    whatYouWillLearn: [
      "Advanced React patterns and architecture",
      "State management with Redux, Context API, and Recoil",
      "React performance optimization techniques",
      "Server-side rendering and Next.js",
      "Testing React applications"
    ],
    modules: [
      {
        title: "Advanced Component Patterns",
        lessons: [
          { title: "Higher-Order Components In-Depth", duration: "35 min", type: "video" },
          { title: "Render Props Pattern", duration: "30 min", type: "video" },
          { title: "Custom Hooks Best Practices", duration: "40 min", type: "video" },
          { title: "Context API Advanced Usage", duration: "45 min", type: "video" },
          { title: "Lab: Implementing Advanced Patterns", duration: "75 min", type: "exercise" },
          { title: "Pattern Selection Assessment", duration: "25 min", type: "quiz" }
        ]
      },
      {
        title: "State Management Mastery",
        lessons: [
          { title: "Redux Toolkit Deep Dive", duration: "50 min", type: "video" },
          { title: "Middleware and Side Effects", duration: "45 min", type: "video" },
          { title: "Zustand and Jotai", duration: "40 min", type: "video" },
          { title: "State Persistence Strategies", duration: "35 min", type: "video" },
          { title: "Lab: Building a Complex State Architecture", duration: "90 min", type: "exercise" },
          { title: "State Management Assessment", duration: "30 min", type: "quiz" }
        ]
      }
    ]
  }
};

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeModule, setActiveModule] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState(null);
  const { authUser } = useAuthStore();
  const { enrolledCourses, enrollInCourse, updateCourseProgress } = useCourseStore();
  const location = useLocation();

  useEffect(() => {
    // Check if the URL has a tab parameter
    const queryParams = new URLSearchParams(location.search);
    const tabParam = queryParams.get('tab');
    if (tabParam && (tabParam === 'overview' || tabParam === 'curriculum')) {
      setActiveTab(tabParam);
    }

    const fetchCourseDetail = () => {
      setLoading(true);
      
      try {
        // In a real app, you would fetch from your backend
        // const res = await axiosInstance.get(`/courses/${courseId}`);
        // setCourse(res.data);
        
        // For now, we'll use our mock data
        setTimeout(() => {
          if (courseData[courseId]) {
            setCourse(courseData[courseId]);
            // Check if user is already enrolled using the store
            const isEnrolled = enrolledCourses.some(c => 
              c.title === courseData[courseId].title
            );
            setEnrolled(isEnrolled);
          } else {
            toast.error("Course not found");
          }
          setLoading(false);
        }, 500);
        
      } catch (error) {
        console.error("Error fetching course details:", error);
        toast.error("Failed to load course details");
        setLoading(false);
      }
    };
    
    fetchCourseDetail();
  }, [courseId, location.search, enrolledCourses]);

  const handleEnroll = () => {
    try {
      // In a real app, this would make an API call to enroll the user
      // await axiosInstance.post(`/courses/${courseId}/enroll`);
      
      // Enroll the user in the course (updates the global course store)
      enrollInCourse(course);
      
      toast.success("Successfully enrolled in the course!");
      setEnrolled(true);
      
      // Automatically switch to curriculum tab after enrollment
      setActiveTab("curriculum");
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll in the course");
    }
  };

  const handleStartQuiz = (lesson, module, moduleIndex) => {
    setSelectedQuiz({
      lesson,
      module,
      moduleIndex
    });
  };

  const closeQuizModal = () => {
    setSelectedQuiz(null);
  };

  const handleLessonClick = (lesson) => {
    if (lesson.type !== 'quiz') {
      setSearchTerm(lesson.title);
      
      // Update progress when viewing a lesson (if enrolled)
      if (enrolled) {
        // Video lessons contribute 2% to course progress
        // Exercise lessons contribute 3% to course progress
        const progressIncrease = lesson.type === 'video' ? 2 : 3;
        updateCourseProgress(course.title, progressIncrease);
      }
    }
  };

  const closeWikipediaModal = () => {
    setSearchTerm(null);
  };

  // Function to handle course progress update
  const handleProgressUpdate = (progressIncrease) => {
    if (course && enrolled) {
      updateCourseProgress(course.title, progressIncrease);
      toast.success(`Progress updated: +${progressIncrease}%`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-10 flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-10">
        <div className="text-center p-8 bg-base-100 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">Return to Homepage</Link>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Course Description */}
            <div>
              <h3 className="text-xl font-bold mb-3">Description</h3>
              <p className="text-base-content/80">{course.description}</p>
            </div>
            
            {/* What You'll Learn */}
            <div>
              <h3 className="text-xl font-bold mb-3">What You'll Learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="size-5 text-success flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Prerequisites */}
            <div>
              <h3 className="text-xl font-bold mb-3">Prerequisites</h3>
              <ul className="list-disc pl-5 space-y-1">
                {course.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
            
            {/* Instructor */}
            <div>
              <h3 className="text-xl font-bold mb-3">Instructor</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="avatar">
                  <div className="w-20 h-20 rounded-full">
                    <img src="https://randomuser.me/api/portraits/men/42.jpg" alt={course.instructor} />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{course.instructor}</h4>
                  <p className="text-base-content/80">{course.instructorBio}</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case "curriculum":
        return (
          <div>
            <h3 className="text-xl font-bold mb-6">Course Curriculum</h3>
            <div className="space-y-6">
              {course.modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="bg-base-100 border border-base-300 rounded-lg overflow-hidden">
                  <div
                    className="p-4 bg-base-200 flex justify-between items-center cursor-pointer"
                    onClick={() => setActiveModule(activeModule === moduleIndex ? -1 : moduleIndex)}
                  >
                    <h4 className="font-semibold">
                      Module {moduleIndex + 1}: {module.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{module.lessons.length} lessons</span>
                      <List className="size-5" />
                    </div>
                  </div>
                  
                  {activeModule === moduleIndex && (
                    <div className="divide-y divide-base-300">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div 
                          key={lessonIndex}
                          className="p-4 flex justify-between items-center hover:bg-base-200 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-full flex items-center justify-center 
                              ${lesson.type === 'video' ? 'bg-blue-100 text-blue-500' :
                               lesson.type === 'quiz' ? 'bg-amber-100 text-amber-500' :
                               'bg-green-100 text-green-500'}`}
                            >
                              {lesson.type === 'video' && <Play className="size-4" />}
                              {lesson.type === 'quiz' && <FileText className="size-4" />}
                              {lesson.type === 'exercise' && <BookOpen className="size-4" />}
                            </div>
                            <span
                              className={lesson.type !== 'quiz' ? "cursor-pointer hover:text-primary hover:underline" : ""}
                              onClick={() => lesson.type !== 'quiz' && handleLessonClick(lesson)}
                            >
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-base-content/70">{lesson.duration}</div>
                            {lesson.type === 'quiz' && enrolled && (
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartQuiz(lesson, module, moduleIndex);
                                }}
                              >
                                Take Quiz
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Complete Module button */}
                      {enrolled && (
                        <div className="p-4 flex justify-center">
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              // Mark module as completed (15% per module)
                              updateCourseProgress(course.title, 15);
                              toast.success(`Module "${module.title}" marked as completed!`);
                            }}
                          >
                            Mark Module as Completed
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <Link to="/" className="btn btn-ghost gap-2 mb-6">
        <ArrowLeft className="size-4" />
        Back to Courses
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="badge badge-lg">{course.category}</div>
            <div className="flex items-center gap-1">
              <Users className="size-4" />
              <span>{course.enrolledCount} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="size-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="size-4" />
              <span>{course.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-amber-500 text-amber-500" />
              <span>{course.rating}</span>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-xl mb-8">
            <img 
              src={course.image} 
              alt={course.title} 
              className="w-full object-cover h-64 md:h-80"
            />
          </div>
          
          <div className="tabs tabs-boxed mb-6">
            <button 
              className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button 
              className={`tab ${activeTab === "curriculum" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("curriculum")}
            >
              Curriculum
            </button>
          </div>
          
          {renderContent()}
        </div>
        
        {/* Enrollment Card */}
        <div className="lg:col-span-1">
          <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm p-6 sticky top-24">
            <div className="text-3xl font-bold mb-4 flex items-center gap-2">
              <span className="text-primary">Free</span>
              <span className="text-base line-through text-base-content/50">$49.99</span>
            </div>
            
            {enrolled ? (
              <div className="space-y-4">
                <div className="alert alert-success">
                  <Check className="size-5" />
                  <span>You are enrolled in this course</span>
                </div>
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => {
                    // Set the active tab to curriculum
                    setActiveTab("curriculum");
                    // Scroll to the curriculum section
                    window.scrollTo({
                      top: document.querySelector('.tabs').offsetTop - 100,
                      behavior: 'smooth'
                    });
                  }}
                >
                  Continue Learning
                </button>
              </div>
            ) : (
              <button 
                className="btn btn-primary btn-block"
                onClick={handleEnroll}
              >
                Enroll Now
              </button>
            )}
            
            <div className="divider"></div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">This course includes:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Play className="size-4 text-primary" />
                  <span>
                    {course.modules.reduce((acc, module) => 
                      acc + module.lessons.filter(lesson => lesson.type === 'video').length, 0)
                    } video lessons
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <span>
                    {course.modules.reduce((acc, module) => 
                      acc + module.lessons.filter(lesson => lesson.type === 'quiz').length, 0)
                    } quizzes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  <span>
                    {course.modules.reduce((acc, module) => 
                      acc + module.lessons.filter(lesson => lesson.type === 'exercise').length, 0)
                    } practical exercises
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <span>Full lifetime access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quiz Modal */}
      {selectedQuiz && (
        <QuizModal 
          lesson={selectedQuiz.lesson} 
          module={selectedQuiz.module}
          courseId={courseId}
          moduleIndex={selectedQuiz.moduleIndex}
          onClose={closeQuizModal}
          onProgressUpdate={handleProgressUpdate}
        />
      )}
      
      {/* Wikipedia Modal */}
      {searchTerm && (
        <WikipediaModal 
          searchTerm={searchTerm}
          onClose={closeWikipediaModal}
        />
      )}
    </div>
  );
};

export default CourseDetailPage; 