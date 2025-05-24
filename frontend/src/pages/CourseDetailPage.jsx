import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import useCourseStore from "../store/useCourseStore";
import { BookOpen, Clock, Users, Star, Play, Check, List, ArrowLeft, FileText, X, Award, HelpCircle, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Client-side quiz question pool (moved/duplicated from HomePage.jsx)
const questionPools = {
  python: [
    {
      question: "What type of language is Python?",
      options: ["Compiled language", "Assembly language", "Interpreted language", "Machine language"],
      correctAnswer: 2
    },
    {
      question: "Which of these is NOT a Python data type?",
      options: ["List", "Dictionary", "Array", "Tuple"],
      correctAnswer: 2
    },
    {
      question: "What is the correct way to create a function in Python?",
      options: ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"],
      correctAnswer: 1
    },
    {
      question: "What symbol is used for single-line comments in Python?",
      options: ["//", "#", "/* */", "--"],
      correctAnswer: 1
    },
    {
      question: "Which of these is a Python framework for web development?",
      options: ["React", "Django", "Express", "Ruby on Rails"],
      correctAnswer: 1
    },
    {
      question: "In Python, what does the 'self' keyword refer to?",
      options: ["The main program file", "The current function", "The current module", "The instance of the class"],
      correctAnswer: 3
    },
  ],
  java: [
    {
      question: "What is the entry point for a Java application?",
      options: ["main() method", "start() method", "run() method", "init() method"],
      correctAnswer: 0
    },
    {
      question: "Which keyword is used to define a constant in Java?",
      options: ["static", "final", "const", "abstract"],
      correctAnswer: 1
    },
    {
      question: "Which of these is a Java framework for web applications?",
      options: ["Spring", "Flask", "Django", "Express"],
      correctAnswer: 0
    },
    {
      question: "What is the correct way to declare a variable in Java?",
      options: ["variable x;", "int x;", "x = int;", "declare int x;"],
      correctAnswer: 1
    },
    {
      question: "What tool might be useful when working with Java?",
      options: ["Documentation tools", "Analysis software", "Collaboration platforms", "Depends on the specific task"],
      correctAnswer: 3
    }
  ]
  // Add other topics as needed
};

// Generic question templates that can be adapted to any topic (copied from HomePage.jsx)
const generateGenericQuestion = (topic) => {
  const genericQuestions = [
    {
      template: "What is one benefit of studying %s?",
      options: [
        "Career opportunities",
        "Personal development",
        "Problem-solving skills",
        "All of the above"
      ],
      correctAnswer: 3
    },
    {
      template: "Where can you learn more about %s?",
      options: [
        "Online courses",
        "Universities",
        "Books and publications",
        "All of the above"
      ],
      correctAnswer: 3
    },
    {
      template: "Which of these is likely NOT related to %s?",
      options: [
        "Research papers",
        "Cooking recipes",
        "Academic journals",
        "Professional conferences"
      ],
      correctAnswer: 1
    },
    {
      template: "What skill might be most valuable when studying %s?",
      options: [
        "Critical thinking",
        "Memorization",
        "Creativity",
        "Depends on the specific field"
      ],
      correctAnswer: 3
    },
    {
      template: "How might %s evolve in the next decade?",
      options: [
        "Become more specialized",
        "Become more accessible to the general public",
        "Incorporate more technology",
        "All of the above are possible"
      ],
      correctAnswer: 3
    },
     {
      template: "How has technology changed the field of %s?",
      options: [
        "Made information more accessible",
        "Improved analysis techniques",
        "Created new specializations",
        "All of these ways"
      ],
      correctAnswer: 3
    }
  ];

  // Select a subset of generic questions if needed (optional, can use all)
  const selectedGenericTemplates = shuffleArray(genericQuestions).slice(0, 5); // Select 5 generic questions

  return selectedGenericTemplates.map(q => ({
    question: q.template.replace('%s', topic),
    options: shuffleArray([...q.options]), // Shuffle options for generic questions too
    correctAnswer: q.options.findIndex(opt => opt === q.options[q.correctAnswer]), // Find correct index in shuffled options
    id: `gen-${Math.random().toString(36).substring(2, 15)}` // Add a simple unique ID
  }));
};

// Function to shuffle an array (moved/duplicated from HomePage.jsx)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Function to generate quiz questions (adapted from HomePage.jsx)
const generateQuizQuestions = (topic) => {
  const topicLower = topic.toLowerCase();
  const NUM_QUESTIONS = 5;

  let availableQuestions = [];
  for (const key in questionPools) {
    if (topicLower.includes(key)) {
      availableQuestions = [...questionPools[key]];
      break;
    }
  }

  // If no predefined questions for the specific topic, use generic ones as a fallback
   if (availableQuestions.length === 0) {
       console.warn(`No predefined questions for topic: "${topic}". Generating generic questions.`);
       availableQuestions = generateGenericQuestion(topic); // Use generic questions
       // If even generic question generation fails or returns empty, still return empty
       if (availableQuestions.length === 0) {
           console.error("Failed to generate even generic questions.");
           return [];
       }
   } else {
       console.log(`Found predefined questions for topic: "${topic}".`);
   }


  // Shuffle questions and select a subset (only needed if availableQuestions > NUM_QUESTIONS)
  const questionsToSelect = availableQuestions.length > NUM_QUESTIONS ? shuffleArray(availableQuestions) : availableQuestions;
  const selectedQuestions = questionsToSelect.slice(0, Math.min(NUM_QUESTIONS, questionsToSelect.length));


  // Shuffle options for each selected question and ensure consistent format
  return selectedQuestions.map(q => {
    // If questions are from the predefined pools, options are already strings,
    // and correctAnswer is the index. If from generic, we created optionPairs.
    // Let's unify the format here if necessary, or ensure generateGenericQuestion
    // returns the same structure as the predefined pools.
    // Assuming generateGenericQuestion returns {question: string, options: string[], correctAnswer: index}

    const optionPairs = q.options.map((opt, idx) => ({
      text: opt,
      isCorrect: idx === q.correctAnswer
    }));
    const shuffledOptions = shuffleArray(optionPairs);
    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

    return {
      question: q.question,
      options: shuffledOptions.map(opt => opt.text),
      correctAnswer: newCorrectIndex,
      id: q.id || `q${Math.random().toString(36).substring(2, 15)}` // Use existing ID or generate one
    };
  });
};

// Quiz Modal Component
const QuizModal = ({ lesson, module, courseId, moduleIndex, onClose, onProgressUpdate }) => {
  // State variables matching HomePage quiz structure
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState([]); // Use quizQuestions like HomePage
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Use 0-indexed like HomePage
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0); // Use quizScore like HomePage
  const [error, setError] = useState(null);
  const { authUser } = useAuthStore();

  useEffect(() => {
    startQuiz(); // Start the quiz when modal opens
  }, []);

  // Function to start the quiz (adapted from HomePage.jsx)
  const startQuiz = () => {
    console.log("Starting quiz from QuizModal");
    setLoading(true);
    setError(null); // Clear errors
    setQuizSubmitted(false); // Reset submitted state
    setSelectedAnswers({}); // Clear previous answers
    setCurrentQuestionIndex(0); // Go to the first question
    setQuizScore(0); // Reset score
    
    // Determine the topic for question generation
    let topic = lesson.title; // Start with lesson title
    const moduleTitle = module.title.toLowerCase();
    const lessonTitle = lesson.title.toLowerCase();

    if (moduleTitle.includes('python') || lessonTitle.includes('python')) {
        topic = 'python';
    } else if (moduleTitle.includes('java') || lessonTitle.includes('java')) {
        topic = 'java';
    } else {
        // If no specific keyword found, use the lesson title as a fallback,
        // but the generateQuizQuestions function will likely return empty if no match
        topic = lesson.title;
    }

    console.log("Attempting to generate quiz for topic:", topic); // Added log

    const questions = generateQuizQuestions(topic);
    
    if (questions.length === 0) {
        setError(`Could not generate quiz questions for topic: "${topic}". Make sure there are questions available for this topic in the code.`); // Updated error message
        setLoading(false);
        return;
    }

    setQuizQuestions(questions);
    setLoading(false);
    console.log("Quiz questions generated successfully:", questions); // Added log
  };

  // handleSelectAnswer adapted from HomePage.jsx
  const handleSelectAnswer = (questionIndex, optionIndex) => {
    if (quizSubmitted) return; // Prevent changing answers after submission
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  // handleSubmitQuiz adapted from submitQuiz in HomePage.jsx
  const handleSubmitQuiz = () => {
    console.log("Submitting quiz");
    let score = 0;
    
    quizQuestions.forEach((q, index) => {
      // Check if the selected answer index matches the correct answer index
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    
    setQuizScore(score);
    setQuizSubmitted(true);
    console.log("Quiz submitted. Score:", score, "/", quizQuestions.length);

    // Note: Progress update logic might need to be reviewed or adapted
    // if course progress is tied to quiz completion via the backend.
    // For now, we'll keep the existing onProgressUpdate call, 
    // assuming it handles frontend completion.
    const percentage = quizQuestions.length > 0 ? Math.round((score / quizQuestions.length) * 100) : 0;
    const progressIncrease = Math.max(5, Math.round(percentage * 0.15));
    onProgressUpdate(progressIncrease);
  };

  // handleNextQuestion adapted from goToNextQuestion in HomePage.jsx
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // handlePrevQuestion adapted from goToPreviousQuestion in HomePage.jsx
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // restartQuiz function (already added, but ensure it calls startQuiz)
  const restartQuiz = () => {
    console.log("Restarting quiz");
    startQuiz(); // Call startQuiz to regenerate questions and reset state
  };

  // getScoreColor function remains the same
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
            {/* Removed Try Again button here, as startQuiz is called on mount */}
          </div>
        </div>
      </div>
    );
  }

  // Render Quiz Results (adapted from HomePage.jsx results JSX)
  if (quizSubmitted) {
    // Calculate percentage for display
    const percentage = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;
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
                <div className={`stat-value ${getScoreColor(percentage)}`}>
                  {quizScore}/{quizQuestions.length}
                </div>
                <div className="stat-desc">{percentage}% correct</div>
              </div>
            </div>
          </div>
          
          <div className="divider">Answers</div>
          
          <div className="space-y-6">
            {quizQuestions.map((question, index) => (
              <div key={question.id || index} className="bg-base-200 p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-base-100 text-base-content size-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="font-medium">{question.question}</div>
                </div>
                <div className="pl-9">
                   {/* Display user's answer and correctness */}
                   <div className="flex items-center gap-2 mb-1">
                     <div className={`font-medium ${selectedAnswers[index] === question.correctAnswer ? 'text-success' : 'text-error'}`}>
                       Your answer: {question.options[selectedAnswers[index]] || 'Not answered'} {/* Display user's chosen option text */}
                     </div>
                     {selectedAnswers[index] === question.correctAnswer ?
                       <Check className="size-5 text-success" /> :
                       <X className="size-5 text-error" />
                     }
                   </div>
                   {/* Display correct answer if user was wrong */}
                   {selectedAnswers[index] !== question.correctAnswer && (
                     <div className="text-success font-medium">
                       Correct answer: {question.options[question.correctAnswer]} {/* Display correct option text */}
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
            <button 
              className="btn btn-outline ml-4"
              onClick={restartQuiz}
            >
              <RefreshCw size={18} className="mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Quiz Questions (adapted from HomePage.jsx quiz JSX)
  if (!quizQuestions || quizQuestions.length === 0) return null; // Don't render if no questions

  const currentQuestionData = quizQuestions[currentQuestionIndex]; // Use 0-indexed index
  const totalQuestions = quizQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

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
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          <div className="text-sm">
            {answeredCount} of {totalQuestions} answered
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
                  ${selectedAnswers[currentQuestionIndex] === index 
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:bg-base-200'
                  }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  className="radio radio-primary"
                  checked={selectedAnswers[currentQuestionIndex] === index}
                  onChange={() => handleSelectAnswer(currentQuestionIndex, index)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6 gap-4 sticky bottom-0 bg-base-100 pt-4 border-t">
          <button 
            className="btn btn-outline"
            disabled={currentQuestionIndex === 0}
            onClick={handlePrevQuestion}
          >
            Previous
          </button>
          
          {/* Pagination/Question Navigation */}
          <div className="flex-grow flex justify-center">
            <div className="join">
              {quizQuestions.map((_, index) => (
                <button 
                  key={index}
                  className={`join-item btn btn-sm ${
                    currentQuestionIndex === index 
                      ? 'btn-primary' 
                      : index in selectedAnswers 
                        ? 'btn-success' 
                        : 'btn-ghost'
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Next or Submit Button */}
          {currentQuestionIndex < quizQuestions.length - 1 ? (
            <button 
              className="btn btn-primary"
              onClick={handleNextQuestion}
            >
              Next
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              disabled={answeredCount < totalQuestions} // Disable if not all questions answered
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