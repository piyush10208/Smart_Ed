import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  Calendar, 
  BarChart, 
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Search,
  X,
  Loader,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw
} from "lucide-react";
import CourseCard from "../components/CourseCard";
import CalendarModal from '../components/CalendarModal';

const HomePage = () => {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setShowSearchModal(true);
    
    try {
      const wikipediaURL = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&srlimit=10&format=json&origin=*`;
      
      const response = await fetch(wikipediaURL);
      const data = await response.json();
      
      if (!data.query || !data.query.search) {
        throw new Error("No results found");
      }
      
      setSearchResults(data.query.search);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchError(error.message || "An error occurred while searching");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTopicClick = (topic) => {
    setSearchQuery(topic);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
  };

  // Function to start a quiz on the searched topic
  const startQuiz = async () => {
    setIsLoadingQuiz(true);
    setShowQuiz(true);
    
    try {
      // Generate randomized quiz questions based on the search topic
      const questions = generateQuizQuestions(searchQuery);
      setQuizQuestions(questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizSubmitted(false);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsLoadingQuiz(false);
    }
  };
  
  // Function to generate questions based on the topic
  const generateQuizQuestions = (topic) => {
    // This function now generates randomized questions each time
    const topicLower = topic.toLowerCase();
    
    // Large pool of questions for each topic
    const questionPools = {
      python: [
        {
          question: "What type of language is Python?",
          options: [
            "Compiled language",
            "Assembly language",
            "Interpreted language",
            "Machine language"
          ],
          correctAnswer: 2
        },
        {
          question: "Which of these is NOT a Python data type?",
          options: [
            "List",
            "Dictionary",
            "Array",
            "Tuple"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the correct way to create a function in Python?",
          options: [
            "function myFunc():",
            "def myFunc():",
            "create myFunc():",
            "func myFunc():"
          ],
          correctAnswer: 1
        },
        {
          question: "What symbol is used for single-line comments in Python?",
          options: [
            "//",
            "#",
            "/* */",
            "--"
          ],
          correctAnswer: 1
        },
        {
          question: "Which of these is a Python framework for web development?",
          options: [
            "React",
            "Django",
            "Express",
            "Ruby on Rails"
          ],
          correctAnswer: 1
        },
        {
          question: "In Python, what does the 'self' keyword refer to?",
          options: [
            "The main program file",
            "The current function",
            "The current module",
            "The instance of the class"
          ],
          correctAnswer: 3
        },
        {
          question: "Which of these is used to handle exceptions in Python?",
          options: [
            "try...catch",
            "if...else",
            "try...except",
            "for...while"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the purpose of the __init__ method in Python classes?",
          options: [
            "To initialize class variables",
            "To import modules",
            "To define class methods",
            "To iterate through lists"
          ],
          correctAnswer: 0
        },
        {
          question: "Which Python library is commonly used for data analysis?",
          options: [
            "Flask",
            "Django",
            "Pandas",
            "Pygame"
          ],
          correctAnswer: 2
        },
        {
          question: "What does PEP 8 refer to in Python?",
          options: [
            "A popular Python library",
            "A style guide for Python code",
            "A Python enhancement proposal",
            "A testing framework"
          ],
          correctAnswer: 1
        },
        {
          question: "How do you create a list in Python?",
          options: [
            "list = (1, 2, 3)",
            "list = [1, 2, 3]",
            "list = {1, 2, 3}",
            "list = <1, 2, 3>"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a Python decorator?",
          options: [
            "A design pattern in Python",
            "A function that takes another function and extends its behavior",
            "A class used for GUI elements",
            "A special type of comment"
          ],
          correctAnswer: 1
        }
      ],
      mathematics: [
        {
          question: "What is the value of π (pi) to two decimal places?",
          options: [
            "3.12",
            "3.14",
            "3.16",
            "3.18"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the derivative of x²?",
          options: [
            "x",
            "2x",
            "x²",
            "2"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the Pythagorean theorem?",
          options: [
            "a² + b² = c²",
            "a + b = c",
            "a × b = c",
            "a² - b² = c²"
          ],
          correctAnswer: 0
        },
        {
          question: "What is the value of the square root of -1?",
          options: [
            "1",
            "-1",
            "i",
            "0"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the area of a circle with radius r?",
          options: [
            "πr",
            "2πr",
            "πr²",
            "2πr²"
          ],
          correctAnswer: 2
        },
        {
          question: "Which of these is NOT a type of triangle based on angles?",
          options: [
            "Acute",
            "Right",
            "Obtuse",
            "Parallel"
          ],
          correctAnswer: 3
        },
        {
          question: "What is the sum of angles in a triangle?",
          options: [
            "90 degrees",
            "180 degrees",
            "270 degrees",
            "360 degrees"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a prime number?",
          options: [
            "A number divisible by 2",
            "A number divisible only by 1 and itself",
            "A number with three factors",
            "A number that is even"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the value of sin(90°)?",
          options: [
            "0",
            "1",
            "-1",
            "Undefined"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the formula for the volume of a sphere?",
          options: [
            "4πr²",
            "πr²h",
            "4/3πr³",
            "2πrh"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the quadratic formula?",
          options: [
            "x = (-b ± √(b² - 4ac))/2a",
            "x = -b/a",
            "x = a² + b² + c²",
            "x = (a + b)/c"
          ],
          correctAnswer: 0
        },
        {
          question: "What does the symbol ∫ represent in calculus?",
          options: [
            "Summation",
            "Integration",
            "Differentiation",
            "Multiplication"
          ],
          correctAnswer: 1
        }
      ],
      physics: [
        {
          question: "What is Newton's First Law about?",
          options: [
            "Gravity",
            "Inertia",
            "Action and reaction",
            "Acceleration"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the unit of force in the International System of Units?",
          options: [
            "Joule",
            "Newton",
            "Watt",
            "Pascal"
          ],
          correctAnswer: 1
        },
        {
          question: "What does E=mc² represent?",
          options: [
            "Conservation of energy",
            "Speed of light",
            "Mass-energy equivalence",
            "Gravitational force"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the SI unit of electric current?",
          options: [
            "Volt",
            "Watt",
            "Ampere",
            "Ohm"
          ],
          correctAnswer: 2
        },
        {
          question: "Which scientist is known for the theory of relativity?",
          options: [
            "Isaac Newton",
            "Niels Bohr",
            "Albert Einstein",
            "Galileo Galilei"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the speed of light in vacuum (approximate)?",
          options: [
            "300,000 km/s",
            "150,000 km/s",
            "200,000 km/s",
            "250,000 km/s"
          ],
          correctAnswer: 0
        },
        {
          question: "Which of these is NOT a fundamental force of nature?",
          options: [
            "Gravity",
            "Electromagnetism",
            "Strong nuclear force",
            "Centrifugal force"
          ],
          correctAnswer: 3
        },
        {
          question: "What is the law of conservation of energy?",
          options: [
            "Energy can be created but not destroyed",
            "Energy can be destroyed but not created",
            "Energy cannot be created or destroyed, only transformed",
            "Energy always increases in a closed system"
          ],
          correctAnswer: 2
        },
        {
          question: "What does Ohm's law state?",
          options: [
            "Power equals voltage times current",
            "Current equals voltage divided by resistance",
            "Resistance equals power divided by current",
            "Voltage equals current times power"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the unit of energy in the SI system?",
          options: [
            "Newton",
            "Watt",
            "Joule",
            "Pascal"
          ],
          correctAnswer: 2
        },
        {
          question: "What does the uncertainty principle in quantum mechanics describe?",
          options: [
            "The inability to predict weather patterns",
            "The impossibility of precisely measuring both position and momentum simultaneously",
            "The uncertainty in experimental measurements",
            "The unpredictability of atomic decay"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the formula for calculating work?",
          options: [
            "Work = mass × acceleration",
            "Work = force × distance",
            "Work = mass × velocity",
            "Work = force / distance"
          ],
          correctAnswer: 1
        }
      ],
      "web development": [
        {
          question: "Which language is used for styling web pages?",
          options: [
            "HTML",
            "JavaScript",
            "CSS",
            "PHP"
          ],
          correctAnswer: 2
        },
        {
          question: "What does DOM stand for in web development?",
          options: [
            "Document Object Model",
            "Data Object Model",
            "Digital Ordinance Model",
            "Document Orientation Model"
          ],
          correctAnswer: 0
        },
        {
          question: "Which of these is a JavaScript framework?",
          options: [
            "Django",
            "Flask",
            "Ruby on Rails",
            "React"
          ],
          correctAnswer: 3
        },
        {
          question: "What is the purpose of HTTP?",
          options: [
            "To style web pages",
            "To transfer hypertext between client and server",
            "To execute code on the server",
            "To define the structure of web pages"
          ],
          correctAnswer: 1
        },
        {
          question: "Which HTML tag is used to create a hyperlink?",
          options: [
            "<link>",
            "<a>",
            "<href>",
            "<url>"
          ],
          correctAnswer: 1
        },
        {
          question: "What does API stand for in web development?",
          options: [
            "Application Programming Interface",
            "Advanced Programming Integration",
            "Automated Program Interface",
            "Application Process Integration"
          ],
          correctAnswer: 0
        },
        {
          question: "Which of these is used to store data on the client-side?",
          options: [
            "Database",
            "Server",
            "Cookies",
            "API"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the purpose of HTTPS?",
          options: [
            "To make websites load faster",
            "To ensure secure communication over the internet",
            "To enable video streaming",
            "To connect to databases"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a CDN in web development?",
          options: [
            "Content Distribution Network",
            "Creative Design Network",
            "Code Development Node",
            "Client Data Navigator"
          ],
          correctAnswer: 0
        },
        {
          question: "What is responsive web design?",
          options: [
            "Websites that respond to user input",
            "Websites that load quickly",
            "Websites that adapt to different screen sizes",
            "Websites that use animations"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the purpose of CSS flexbox?",
          options: [
            "To add animations to elements",
            "To create a responsive layout design",
            "To connect to databases",
            "To handle form submissions"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a REST API?",
          options: [
            "A style guide for JavaScript",
            "A testing framework",
            "An architectural style for web services",
            "A database management system"
          ],
          correctAnswer: 2
        }
      ],
      "artificial intelligence": [
        {
          question: "What is machine learning?",
          options: [
            "Programming computers to follow explicit instructions",
            "Teaching computers to learn from data without explicit programming",
            "Using robots to perform physical tasks",
            "Creating virtual reality environments"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a neural network?",
          options: [
            "A computer network connecting multiple devices",
            "A biological network of neurons in the brain",
            "A computational model inspired by the human brain",
            "A network security protocol"
          ],
          correctAnswer: 2
        },
        {
          question: "Which of these is NOT a type of machine learning?",
          options: [
            "Supervised learning",
            "Unsupervised learning",
            "Reinforcement learning",
            "Descriptive learning"
          ],
          correctAnswer: 3
        },
        {
          question: "What is NLP in AI?",
          options: [
            "New Learning Protocol",
            "Natural Language Processing",
            "Neural Link Processing",
            "Network Learning Platform"
          ],
          correctAnswer: 1
        },
        {
          question: "Which company developed the ChatGPT model?",
          options: [
            "Google",
            "Microsoft",
            "OpenAI",
            "Amazon"
          ],
          correctAnswer: 2
        },
        {
          question: "What is computer vision?",
          options: [
            "A computer's ability to see physical objects",
            "AI technology that enables computers to interpret visual information",
            "The visual display capabilities of computers",
            "A visual programming interface"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the Turing test designed to evaluate?",
          options: [
            "Computer processing speed",
            "Computer memory capacity",
            "A machine's ability to exhibit intelligent behavior",
            "A computer's visual recognition capabilities"
          ],
          correctAnswer: 2
        },
        {
          question: "What is deep learning?",
          options: [
            "Learning that occurs deep in the ocean",
            "A subset of machine learning using neural networks with many layers",
            "Learning that takes a long time to master",
            "A philosophical approach to education"
          ],
          correctAnswer: 1
        },
        {
          question: "What is 'overfitting' in machine learning?",
          options: [
            "When a model works too well on training data",
            "When a model performs well on new, unseen data",
            "When a model is too complex for the available computing power",
            "When a model is trained for too long"
          ],
          correctAnswer: 0
        },
        {
          question: "What is a 'feature' in machine learning?",
          options: [
            "A new functionality in the software",
            "An individual measurable property of the data",
            "A bug that needs to be fixed",
            "A type of neural network"
          ],
          correctAnswer: 1
        },
        {
          question: "What is the purpose of 'training data' in machine learning?",
          options: [
            "To test the model's performance",
            "To diagnose errors in the algorithm",
            "To teach the model patterns and relationships",
            "To validate the model's predictions"
          ],
          correctAnswer: 2
        },
        {
          question: "What does 'GANs' stand for in AI?",
          options: [
            "Global Artificial Networks",
            "Generative Adversarial Networks",
            "Gradient Approximate Nodes",
            "Graphics And Navigation Systems"
          ],
          correctAnswer: 1
        }
      ]
    };
    
    // Generic question templates that can be adapted to any topic
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
          template: "Which learning approach might be most effective for %s?",
          options: [
            "Theoretical study",
            "Practical application",
            "Guided mentorship",
            "A combination of different approaches"
          ],
          correctAnswer: 3
        },
        {
          template: "What might be a challenge when learning about %s?",
          options: [
            "Finding reliable resources",
            "Understanding complex concepts",
            "Keeping up with new developments",
            "All of these could be challenges"
          ],
          correctAnswer: 3
        },
        {
          template: "Which field might have connections with %s?",
          options: [
            "Psychology",
            "Business",
            "Technology",
            "All of these fields"
          ],
          correctAnswer: 3
        },
        {
          template: "What is a good starting point for beginners in %s?",
          options: [
            "Reading introductory books",
            "Taking online courses",
            "Joining community forums",
            "Any of these approaches"
          ],
          correctAnswer: 3
        },
        {
          template: "How might professionals in %s collaborate with others?",
          options: [
            "Research projects",
            "Industry conferences",
            "Online communities",
            "All of these methods"
          ],
          correctAnswer: 3
        },
        {
          template: "What tool might be useful when working with %s?",
          options: [
            "Analysis software",
            "Documentation tools",
            "Collaboration platforms",
            "Depends on the specific task"
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
      
      return genericQuestions.map(q => ({
        question: q.template.replace('%s', topic),
        options: [...q.options], // Create a copy of the options
        correctAnswer: q.correctAnswer
      }));
    };
    
    // Function to shuffle an array
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    // Number of questions to select for each quiz
    const NUM_QUESTIONS = 5;
    
    // Check if we have predefined questions for this topic
    let availableQuestions = [];
    for (const key in questionPools) {
      if (topicLower.includes(key)) {
        availableQuestions = [...questionPools[key]];
        break;
      }
    }
    
    // If no predefined questions, generate generic ones
    if (availableQuestions.length === 0) {
      availableQuestions = generateGenericQuestion(topic);
    }
    
    // Shuffle the questions and select a subset
    const shuffledQuestions = shuffleArray(availableQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(NUM_QUESTIONS, shuffledQuestions.length));
    
    // Shuffle the options for each question to add more variation
    return selectedQuestions.map(q => {
      // Create pairs of options and their correct index
      const optionPairs = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctAnswer
      }));
      
      // Shuffle the option pairs
      const shuffledOptions = shuffleArray(optionPairs);
      
      // Find the new index of the correct answer
      const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);
      
      // Return the question with shuffled options
      return {
        question: q.question,
        options: shuffledOptions.map(opt => opt.text),
        correctAnswer: newCorrectIndex
      };
    });
  };
  
  // Function to handle selecting an answer
  const selectAnswer = (questionIndex, optionIndex) => {
    if (quizSubmitted) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };
  
  // Function to go to the next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  // Function to go to the previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Function to submit the quiz
  const submitQuiz = () => {
    let score = 0;
    
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    
    setQuizScore(score);
    setQuizSubmitted(true);
  };
  
  // Function to restart the quiz
  const restartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuizSubmitted(false);
  };
  
  // Function to close the quiz modal
  const closeQuizModal = () => {
    setShowQuiz(false);
  };

  // Featured courses
  const featuredCourses = [
    {
      _id: "1",
      title: "Introduction to Computer Science",
      instructor: "Dr. Alan Smith",
      enrolledCount: 1240,
      description: "Learn the fundamentals of computer science and programming with this comprehensive course designed for beginners.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      color: "bg-blue-500",
      category: "Computer Science",
      duration: "12 weeks",
      level: "Beginner",
      featured: true
    },
    {
      _id: "2",
      title: "Advanced Mathematics",
      instructor: "Dr. Maria Johnson",
      enrolledCount: 876,
      description: "Dive deep into advanced mathematical concepts including calculus, linear algebra, and statistics.",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904",
      color: "bg-purple-500",
      category: "Mathematics",
      duration: "16 weeks",
      level: "Advanced",
      featured: true
    },
    {
      _id: "3",
      title: "Physics Fundamentals",
      instructor: "Prof. Robert Chen",
      enrolledCount: 654,
      description: "Explore the laws of physics and their applications in this comprehensive course.",
      image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
      color: "bg-amber-500",
      category: "Physics",
      duration: "10 weeks",
      level: "Intermediate",
      featured: true
    }
  ];

  // Key features
  const features = [
    {
      icon: BookOpen,
      title: "Interactive Courses",
      description: "Access a wide range of interactive courses with multimedia content"
    },
    {
      icon: Users,
      title: "Collaborative Learning",
      description: "Connect with peers and instructors for group projects and discussions"
    },
    {
      icon: Calendar,
      title: "Course Schedule",
      description: "Keep track of class schedules, assignments, and important deadlines"
    },
    {
      icon: BarChart,
      title: "Progress Tracking",
      description: "Monitor your academic performance and growth in real-time"
    }
  ];

  // Footer links
  const footerLinks = {
    platform: [
      { title: "About Us", href: "/about" },
      { title: "Careers", href: "#" },
      { title: "Partners", href: "#" },
      { title: "Blog", href: "#" }
    ],
    resources: [
      { title: "Documentation", href: "#" },
      { title: "Help Center", href: "#" },
      { title: "Community", href: "#" },
      { title: "Webinars", href: "#" }
    ],
    legal: [
      { title: "Terms of Service", href: "#" },
      { title: "Privacy Policy", href: "#" },
      { title: "Cookie Policy", href: "#" },
      { title: "Accessibility", href: "#" }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="bg-base-200 pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold">
                  Elevate Your Learning Experience with SmartEdu
                </h1>
                <p className="text-base-content/70 text-lg">
                  A comprehensive platform designed to transform education through interactive learning, 
                  real-time collaboration, and personalized progress tracking.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  {authUser ? (
                    <>
                      <Link to="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                        <ArrowRight className="size-4" />
                      </Link>
                      <Link to="/dashboard" className="btn btn-outline">
                        Browse Courses
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/signup" className="btn btn-primary">
                        Get Started
                        <ArrowRight className="size-4" />
                      </Link>
                      <Link to="/login" className="btn btn-outline">
                        Login
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Learning Features</h2>
              <p className="text-base-content/70 max-w-2xl mx-auto">
                SmartEdu provides all the tools you need to succeed in your educational journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    if (feature.title === "Interactive Courses") {
                      document.getElementById('featuredCourses').scrollIntoView({ behavior: 'smooth' });
                    } else if (feature.title === "Progress Tracking") {
                      navigate('/dashboard?tab=overview');
                    } else if (feature.title === "Collaborative Learning") {
                      navigate('/dashboard?tab=discussions');
                    } else if (feature.title === "Course Schedule") {
                      setShowCalendarModal(true);
                    }
                  }}
                >
                  <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section id="featuredCourses" className="py-16 bg-base-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold">Featured Courses</h2>
                <p className="text-base-content/70">Explore our most popular courses</p>
              </div>
              <Link to="/dashboard" className="btn btn-outline">
                View All Courses
              </Link>
            </div>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-10">
              <div className="flex items-center bg-base-100 rounded-lg shadow-md overflow-hidden">
                <input 
                  type="text" 
                  placeholder="Search for any topic..." 
                  className="input input-lg flex-grow bg-transparent border-0 focus:outline-none"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary h-full rounded-l-none px-6"
                >
                  <Search className="size-5 mr-2" />
                  Search
                </button>
              </div>
              <div className="absolute -bottom-6 w-full flex justify-center gap-2 text-sm text-base-content/70">
                <span 
                  className="hover:text-primary cursor-pointer" 
                  onClick={() => handleTopicClick("Python")}
                >
                  Python
                </span>
                <span>•</span>
                <span 
                  className="hover:text-primary cursor-pointer"
                  onClick={() => handleTopicClick("Mathematics")}
                >
                  Mathematics
                </span>
                <span>•</span>
                <span 
                  className="hover:text-primary cursor-pointer"
                  onClick={() => handleTopicClick("Physics")}
                >
                  Physics
                </span>
                <span>•</span>
                <span 
                  className="hover:text-primary cursor-pointer"
                  onClick={() => handleTopicClick("Web Development")}
                >
                  Web Development
                </span>
              </div>
            </form>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-base-200 pt-16 pb-8 border-t border-base-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand and Contact */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="size-8 text-primary" />
                <h3 className="text-xl font-bold">SmartEdu</h3>
              </div>
              <p className="text-base-content/70 mb-6 max-w-md">
                Transforming education through technology. Our platform connects students, educators, and
                learning resources to create an enriched educational experience.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-primary" />
                  <span>piyushbhardwaj909@gmail.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-primary" />
                  <span>+91 9368371198</span>
                  <span>+91 9199991999</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-primary" />
                  <span>123 Education Hub, Learning City</span>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h3 className="font-bold text-lg mb-4">Platform</h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-base-content/70 hover:text-primary transition-colors"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-base-content/70 hover:text-primary transition-colors"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="text-base-content/70 hover:text-primary transition-colors"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media and Copyright */}
          <div className="border-t border-base-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-base-content/70 text-sm">
              © {new Date().getFullYear()} SmartEdu. All rights reserved.
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                <ExternalLink className="size-5" />
              </a>
              <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                <Mail className="size-5" />
              </a>
              <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                <Users className="size-5" />
              </a>
              <a href="#" className="text-base-content/70 hover:text-primary transition-colors">
                <BookOpen className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Search Results Modal */}
      {showSearchModal && !showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Search Results</h2>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={closeSearchModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-base-content/70 mb-4">
              Results for: <span className="font-semibold">"{searchQuery}"</span>
            </p>
            
            {!isSearching && !searchError && searchResults.length > 0 && (
              <div className="mb-6">
                <button 
                  className="btn btn-secondary"
                  onClick={startQuiz}
                >
                  <HelpCircle size={18} className="mr-2" />
                  Take a Quiz on {searchQuery}
                </button>
              </div>
            )}
            
            {isSearching ? (
              <div className="flex justify-center py-12">
                <Loader size={32} className="animate-spin text-primary" />
              </div>
            ) : searchError ? (
              <div className="bg-error/10 text-error p-4 rounded-lg">
                {searchError}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-8 text-center">
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm text-base-content/70 mt-2">Try a different search term or browse our courses</p>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.pageid} className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="card-title">{result.title}</h3>
                      <div 
                        className="text-base-content/80"
                        dangerouslySetInnerHTML={{ __html: result.snippet + "..." }} 
                      />
                      <div className="card-actions justify-end">
                        <a 
                          href={`https://en.wikipedia.org/?curid=${result.pageid}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-base-100 pb-2 border-b z-10">
              <h2 className="text-2xl font-bold">
                Quiz: {searchQuery}
              </h2>
              <button 
                className="btn btn-sm btn-ghost"
                onClick={closeQuizModal}
              >
                <X size={20} />
              </button>
            </div>
            
            {isLoadingQuiz ? (
              <div className="flex justify-center py-12">
                <Loader size={32} className="animate-spin text-primary" />
              </div>
            ) : quizSubmitted ? (
              <div className="space-y-6 overflow-y-auto">
                <div className="text-center p-6 bg-base-200 rounded-lg sticky top-16 z-10 mb-4">
                  <h3 className="text-xl font-bold mb-4">Quiz Results</h3>
                  <div className="text-4xl font-bold mb-4 text-primary">
                    {quizScore} / {quizQuestions.length}
                  </div>
                  <div className="text-base-content/70">
                    {quizScore === quizQuestions.length ? (
                      "Perfect score! Excellent job!"
                    ) : quizScore >= quizQuestions.length / 2 ? (
                      "Good job! You have a solid understanding of this topic."
                    ) : (
                      "Keep learning! We have courses that can help you improve in this area."
                    )}
                  </div>
                </div>
                
                <div className="space-y-6 overflow-y-auto">
                  {quizQuestions.map((question, index) => (
                    <div key={index} className="p-4 bg-base-200 rounded-lg">
                      <h4 className="font-bold mb-2">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className={`p-3 rounded-lg flex items-center gap-3 ${
                              selectedAnswers[index] === optIndex
                                ? optIndex === question.correctAnswer
                                  ? "bg-success/20 border border-success"
                                  : "bg-error/20 border border-error"
                                : optIndex === question.correctAnswer
                                  ? "bg-success/20 border border-success"
                                  : "bg-base-100"
                            }`}
                          >
                            {selectedAnswers[index] === optIndex ? (
                              optIndex === question.correctAnswer ? (
                                <CheckCircle className="text-success size-5" />
                              ) : (
                                <XCircle className="text-error size-5" />
                              )
                            ) : optIndex === question.correctAnswer ? (
                              <CheckCircle className="text-success size-5" />
                            ) : (
                              <span className="size-5 text-center">{String.fromCharCode(65 + optIndex)}</span>
                            )}
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-6 sticky bottom-0 bg-base-100 pt-4 border-t">
                  <button
                    className="btn btn-primary"
                    onClick={restartQuiz}
                  >
                    <RefreshCw size={18} className="mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 sticky top-16 bg-base-100 pb-2 z-10">
                  <div className="font-semibold">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </div>
                  <div className="badge badge-lg">
                    {Object.keys(selectedAnswers).length} / {quizQuestions.length} answered
                  </div>
                </div>
                
                <div className="overflow-y-auto max-h-[50vh] pr-2 -mr-2">
                  {quizQuestions.length > 0 && (
                    <div className="p-6 bg-base-200 rounded-lg">
                      <h3 className="text-xl font-bold mb-4">
                        {quizQuestions[currentQuestionIndex].question}
                      </h3>
                      <div className="space-y-3">
                        {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                          <div 
                            key={index}
                            className={`p-4 rounded-lg cursor-pointer hover:bg-base-300 transition-colors flex items-center gap-3 ${
                              selectedAnswers[currentQuestionIndex] === index
                                ? "bg-primary/20 border border-primary"
                                : "bg-base-100"
                            }`}
                            onClick={() => selectAnswer(currentQuestionIndex, index)}
                          >
                            <div className={`size-6 rounded-full grid place-items-center border ${
                              selectedAnswers[currentQuestionIndex] === index
                                ? "border-primary bg-primary text-primary-content"
                                : "border-primary/30"
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-6 gap-4 sticky bottom-0 bg-base-100 pt-4 border-t">
                  <button
                    className="btn btn-outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  
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
                  
                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      className="btn btn-primary"
                      onClick={goToNextQuestion}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="btn btn-accent"
                      onClick={submitQuiz}
                      disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                      title={Object.keys(selectedAnswers).length < quizQuestions.length ? "Please answer all questions" : ""}
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      <CalendarModal 
        isOpen={showCalendarModal} 
        onClose={() => setShowCalendarModal(false)}
        userId={authUser?._id}
      />
    </div>
  );
};

export default HomePage;
