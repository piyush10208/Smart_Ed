import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import useCourseStore from "../store/useCourseStore";
import useQuizStore from "../store/useQuizStore";
import useStudentStore from "../store/useStudentStore";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { 
  BookOpen, 
  Settings, 
  User, 
  GraduationCap, 
  BarChart, 
  Calendar, 
  LucideBookOpen, 
  BookOpenCheck,
  FileText,
  Users,
  Medal,
  MessageSquare,
  Save,
  Sun,
  Moon,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Zap,
  AlertTriangle,
  Activity,
  Loader,
  Eye,
  RefreshCw
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

// Mock recommended courses data - in a real app, this would come from an API
const recommendedCoursesData = [
  {
    id: "db101",
    title: "Advanced Database Design",
    description: "Master database design principles and optimization techniques",
    slug: "advanced-database-design",
    relatedTo: "Computer Science",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
    price: 49.99,
    instructor: "Dr. Maria Johnson",
    duration: "8 weeks"
  },
  {
    id: "react202",
    title: "React Framework Advanced",
    description: "Take your React skills to the next level with advanced patterns",
    slug: "react-framework-advanced",
    relatedTo: "Web Development",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    price: 59.99,
    instructor: "Alex Rodriguez",
    duration: "10 weeks"
  }
];

// Add these courses to the courseData in CourseDetailPage to match existing course structure
const coursesToAdd = {
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

const DashboardPage = () => {
  const { authUser, updateProfile, isUpdatingProfile } = useAuthStore();
  const { selectedUser } = useChatStore();
  const { enrolledCourses, getEnrolledCount, enrollInCourse, fetchEnrolledCourses } = useCourseStore();
  const { quizStats, quizAttempts, fetchQuizData, isLoading: quizLoading } = useQuizStore();
  const { studentStats, learningPatterns, fetchStudentData, isLoading: studentLoading } = useStudentStore();
  const { theme, toggleTheme, isHighContrast, toggleHighContrast } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  
  // State for recommended courses
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [enrollingInCourse, setEnrollingInCourse] = useState(false);
  const [enrollmentSuccessModalOpen, setEnrollmentSuccessModalOpen] = useState(false);
  const [currentlyEnrolledCourse, setCurrentlyEnrolledCourse] = useState(null);
  
  // State for calculated quiz scores
  const [calculatedQuizScores, setCalculatedQuizScores] = useState({
    averageScore: 0,
    bestScore: 0,
    totalAttempts: 0
  });

  // State for profile form
  const [fullName, setFullName] = useState(authUser?.fullName || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Update form state if authUser changes (e.g., after login)
  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || '');
      setBio(authUser.bio || '');
    }
  }, [authUser]);

  // Fetch student and quiz data on initial load
  useEffect(() => {
    fetchStudentData();
    fetchQuizData();
    fetchRecommendedCourses();
    fetchEnrolledCourses();
  }, []);
  
  // Fetch recommended courses based on user performance
  const fetchRecommendedCourses = async () => {
    setIsLoadingRecommendations(true);
    
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate an API call with a timeout and mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use the course IDs that match what's defined in CourseDetailPage.jsx
      const recommendedCoursesWithIDs = [
        {
          _id: "db101", // Match the ID in CourseDetailPage.jsx
          title: "Advanced Database Design",
          description: "Master database design principles and optimization techniques",
          instructor: "Dr. Maria Johnson",
          duration: "8 weeks",
          image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d",
          category: "Computer Science",
          level: "Advanced"
        },
        {
          _id: "react202", // Match the ID in CourseDetailPage.jsx
          title: "React Framework Advanced",
          description: "Take your React skills to the next level with advanced patterns",
          instructor: "Alex Rodriguez",
          duration: "10 weeks",
          image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
          category: "Web Development",
          level: "Advanced"
        }
      ];
      
      setRecommendedCourses(recommendedCoursesWithIDs);
    } catch (error) {
      console.error("Error fetching course recommendations:", error);
      toast.error("Failed to load course recommendations");
    } finally {
      setIsLoadingRecommendations(false);
    }
  };
  
  // Handle clicking on a recommended course
  const handleCourseClick = (course) => {
    // Navigate to course details page using the course ID
    navigate(`/courses/${course._id}`);
  };
  
  // Handle enrolling in a recommended course
  const handleEnrollCourse = async (e, course) => {
    e.preventDefault(); // Prevent default
    e.stopPropagation(); // Prevent triggering the parent card click
    
    // Only proceed if we have a valid course ID
    if (!course || !course._id) return;
    
    setEnrollingInCourse(course._id);
    
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add course to enrolled courses in store
      enrollInCourse({
        id: course._id,
        title: course.title,
        instructor: course.instructor,
        progress: 0
      });
      
      // Store the enrolled course for the success modal
      setCurrentlyEnrolledCourse(course);
      
      // Show success modal instead of toast
      setEnrollmentSuccessModalOpen(true);
      
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error("Failed to enroll in course");
    } finally {
      setEnrollingInCourse(false);
    }
  };
  
  // Handle application for advanced courses (redirect to pre-enrollment)
  const handleCourseApplication = (e, courseId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to the pre-enrollment page for the specific course
    navigate(`/courses/${courseId}/pre-enrollment`);
  };
  
  // Navigate to enrolled course
  const goToEnrolledCourse = () => {
    setEnrollmentSuccessModalOpen(false);
    if (currentlyEnrolledCourse) {
      navigate(`/courses/${currentlyEnrolledCourse._id}`);
    }
  };
  
  // Calculate real quiz scores from attempts
  useEffect(() => {
    if (quizAttempts && quizAttempts.length > 0) {
      // Filter attempts for current user if needed
      const userAttempts = quizAttempts.filter(attempt => 
        !authUser || !authUser.id || attempt.userId === authUser.id
      );
      
      // Calculate scores
      const scores = userAttempts.map(attempt => {
        // Calculate percentage score for this attempt
        // Ensure score doesn't exceed totalQuestions
        const correctScore = Math.min(attempt.score, attempt.totalQuestions);
        return (correctScore / attempt.totalQuestions) * 100;
      });
      
      // Calculate average and best scores
      const avgScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
      
      const bestScore = scores.length > 0 
        ? Math.max(...scores) 
        : 0;
        
      setCalculatedQuizScores({
        averageScore: Math.min(avgScore, 100), // Cap at 100%
        bestScore: Math.min(bestScore, 100), // Cap at 100%
        totalAttempts: userAttempts.length
      });

      console.log('Quiz attempts:', userAttempts);
      console.log('Calculated scores:', scores);
      console.log('Average score:', avgScore);
    }
  }, [quizAttempts, authUser]);

  // Function to fetch trending educational topics
  const fetchTrendingEvents = async () => {
    setLoadingEvents(true);
    try {
      // We'll use multiple APIs to get educational trending topics

      // 1. First, try Coursera API to get trending courses
      const courseraResponse = await fetch(
        'https://api.coursera.org/api/courses.v1?fields=name,description,photoUrl&start=0&limit=3&q=search&query=trending'
      ).catch(() => null);
      
      // 2. Try EdX API for trending topics
      const edxResponse = await fetch(
        'https://api.edx.org/catalog/v1/search?q=trending&page=1&page_size=3'
      ).catch(() => null);

      // 3. Use News API to get trending educational news
      const newsApiKey = 'YOUR_NEWS_API_KEY'; // Replace with your actual API key if available
      const newsResponse = await fetch(
        `https://newsapi.org/v2/everything?q=education+technology+learning&sortBy=popularity&pageSize=3&apiKey=${newsApiKey}`
      ).catch(() => null);

      let trendingItems = [];

      if (courseraResponse && courseraResponse.ok) {
        const courseraData = await courseraResponse.json();
        const courseraItems = courseraData.elements.map(course => ({
          id: course.id || Math.random().toString(36).substring(7),
          title: course.name,
          description: course.description || "Popular course on Coursera",
          thumbnail: course.photoUrl,
          link: `https://www.coursera.org/learn/${course.slug}`,
          source: "Coursera",
          views: Math.floor(Math.random() * 5000) + 1000 // Simulated view count
        }));
        trendingItems = [...trendingItems, ...courseraItems];
      }

      if (edxResponse && edxResponse.ok) {
        const edxData = await edxResponse.json();
        const edxItems = edxData.results.map(course => ({
          id: course.key || Math.random().toString(36).substring(7),
          title: course.title,
          description: course.short_description || "Popular course on EdX",
          thumbnail: course.image_url,
          link: `https://www.edx.org/course/${course.key}`,
          source: "EdX",
          views: Math.floor(Math.random() * 5000) + 1000 // Simulated view count
        }));
        trendingItems = [...trendingItems, ...edxItems];
      }

      if (newsResponse && newsResponse.ok) {
        const newsData = await newsResponse.json();
        const newsItems = newsData.articles.map(article => ({
          id: article.url || Math.random().toString(36).substring(7),
          title: article.title,
          description: article.description || "Trending educational news",
          thumbnail: article.urlToImage,
          link: article.url,
          source: article.source.name,
          views: Math.floor(Math.random() * 5000) + 1000 // Simulated view count
        }));
        trendingItems = [...trendingItems, ...newsItems];
      }

      // Fallback to Wikipedia trending if all else fails or if we need more items
      if (trendingItems.length < 3) {
        // Get current date for the Wikipedia API endpoint
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        // Wikipedia API for most viewed articles
        const wikiResponse = await fetch(
          `https://en.wikipedia.org/api/rest_v1/feed/featured/${year}/${month}/${day}`
        );
        
        if (wikiResponse.ok) {
          const wikiData = await wikiResponse.json();
          
          // Filter articles to find educational ones
          if (wikiData.mostread && wikiData.mostread.articles) {
            const educationalKeywords = ['education', 'learning', 'science', 'history', 'math', 'physics', 'computer', 'technology', 'biology', 'chemistry', 'research', 'university', 'college', 'school', 'academic'];
            
            const educationalArticles = wikiData.mostread.articles
              .filter(article => {
                // Check if title or extract contains educational keywords
                const lowerTitle = article.title.toLowerCase();
                const lowerExtract = (article.extract || '').toLowerCase();
                return educationalKeywords.some(keyword => 
                  lowerTitle.includes(keyword) || lowerExtract.includes(keyword)
                );
              })
              .slice(0, 5)
              .map(article => ({
                id: article.pageid,
                title: article.title,
                description: article.extract || "Educational Wikipedia article",
                views: article.views,
                link: `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title)}`,
                thumbnail: article.thumbnail?.source,
                source: "Wikipedia"
              }));
            
            trendingItems = [...trendingItems, ...educationalArticles];
          }
        }
      }

      // If we still don't have any items, use hardcoded educational topics that are typically trending
      if (trendingItems.length === 0) {
        trendingItems = [
          { 
            id: 'ai-education',
            title: "AI in Education", 
            description: "Artificial Intelligence is transforming teaching and learning methods by personalizing education.",
            thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
            link: "https://www.google.com/search?q=ai+in+education+trends",
            source: "Trending Topic",
            views: 8276
          },
          { 
            id: 'data-science',
            title: "Data Science Fundamentals", 
            description: "Data science continues to be one of the fastest-growing career fields with high demand for skilled professionals.",
            thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
            link: "https://www.google.com/search?q=data+science+education+trends",
            source: "Trending Topic",
            views: 7321
          },
          { 
            id: 'quantum-computing',
            title: "Quantum Computing Basics", 
            description: "Quantum computing education is becoming increasingly important as this emerging technology develops.",
            thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
            link: "https://www.google.com/search?q=quantum+computing+education",
            source: "Trending Topic",
            views: 6104
          },
          { 
            id: 'climate-science',
            title: "Climate Science and Sustainability", 
            description: "Educational resources on climate change and sustainable practices are in high demand.",
            thumbnail: "https://images.unsplash.com/photo-1569683795645-b62e50fbf103",
            link: "https://www.google.com/search?q=climate+science+education+trends",
            source: "Trending Topic",
            views: 5832
          },
          { 
            id: 'blockchain',
            title: "Blockchain Technology", 
            description: "Understanding blockchain fundamentals is becoming essential across many fields beyond cryptocurrency.",
            thumbnail: "https://images.unsplash.com/photo-1639762681057-408e52192e55",
            link: "https://www.google.com/search?q=blockchain+education+trends",
            source: "Trending Topic",
            views: 5091
          }
        ];
      }

      // Limit to 5 items and set state
      setTrendingEvents(trendingItems.slice(0, 5));

      // Update last refreshed timestamp
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching trending educational topics:', error);
      // Fallback data with educational topics in case all APIs fail
      setTrendingEvents([
        { 
          id: 'ai-education',
          title: "AI in Education", 
          description: "Artificial Intelligence is transforming teaching and learning methods by personalizing education.",
          thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
          link: "https://www.google.com/search?q=ai+in+education+trends",
          source: "Trending Topic",
          views: 8276
        },
        { 
          id: 'data-science',
          title: "Data Science Fundamentals", 
          description: "Data science continues to be one of the fastest-growing career fields with high demand for skilled professionals.",
          thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
          link: "https://www.google.com/search?q=data+science+education+trends",
          source: "Trending Topic",
          views: 7321
        },
        { 
          id: 'quantum-computing',
          title: "Quantum Computing Basics", 
          description: "Quantum computing education is becoming increasingly important as this emerging technology develops.",
          thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb",
          link: "https://www.google.com/search?q=quantum+computing+education",
          source: "Trending Topic",
          views: 6104
        }
      ]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch trending topics on component mount and refresh every 30 minutes
  useEffect(() => {
    fetchTrendingEvents();
    
    // Set up interval to refresh trending topics every 30 minutes
    const refreshInterval = setInterval(() => {
      fetchTrendingEvents();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Mock data for educational statistics
  const stats = [
    { id: 1, title: "Enrolled Courses", value: getEnrolledCount().toString(), icon: BookOpen, color: "bg-blue-500" },
  ];

  // Effect to update stats when enrolled courses change
  useEffect(() => {
    stats[0].value = getEnrolledCount().toString();
  }, [enrolledCourses]);

  // Mock upcoming events
  const events = [
    { id: 1, title: "Group Project Meeting", date: "Tomorrow, 3:00 PM", type: "meeting" },
    { id: 2, title: "Algorithm Assignment Due", date: "Friday, 11:59 PM", type: "assignment" },
    { id: 3, title: "Physics Mid-term Exam", date: "Next Monday, 10:00 AM", type: "exam" },
  ];

  // Handle profile update using the store action
  const handleProfileUpdate = () => {
    const updatedProfile = {
      fullName,
      bio
    };
    
    updateProfile(updatedProfile)
      .then(() => {
        toast.success("Profile updated successfully");
      })
      .catch(() => {
        toast.error("Failed to update profile");
      });
  };

  // Handle navigation when exploring a topic
  const handleExploreTopic = (topic) => {
    const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');
    navigate(`/topics/${topicSlug}`); 
  };

  // Format percentage for display
  const formatPercentage = (value) => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));
    return `${Math.round(clampedValue)}%`;
  };

  // Get days of the week for activity chart
  const getDaysOfWeek = () => {
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  };

  // Render the loading spinner
  const renderLoading = () => (
    <div className="flex justify-center items-center py-12">
      <div className="flex flex-col items-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="mt-4 text-base-content/60">Loading dashboard data...</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            {/* Student Dashboard Card */}
            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <GraduationCap size={24} />
                SmartEdu Dashboard
              </h2>
              
              {studentLoading || quizLoading ? renderLoading() : (
                <div className="space-y-6">
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-base-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-base-content/70">Course Completion</span>
                        <BookOpenCheck size={18} className="text-blue-500" />
                    </div>
                      <div className="font-bold text-2xl">{formatPercentage(studentStats.overallProgress)}</div>
                      <div className="w-full bg-base-300 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${studentStats.overallProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-base-200 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-base-content/70">Assessment Score</span>
                        <Award size={18} className="text-green-500" />
                      </div>
                      <div className="font-bold text-2xl">{formatPercentage(calculatedQuizScores.averageScore)}</div>
                      <div className="flex justify-between text-xs text-base-content/70 mt-1">
                        <span>Best: {formatPercentage(calculatedQuizScores.bestScore)}</span>
                        <span>Total Assessments: {calculatedQuizScores.totalAttempts}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Learning Paths */}
                    <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <BookOpen size={18} />
                      Active Learning Paths
                    </h3>
                    {enrolledCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrolledCourses.map((course) => (
                          <div 
                            key={course.id} 
                            className="bg-base-200 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/courses/${course.id}?tab=curriculum`)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{course.title}</span>
                              <span className="badge badge-primary">{course.progress}%</span>
                    </div>
                            <div className="text-sm text-base-content/70 mb-2">Instructor: {course.instructor}</div>
                            <div className="w-full bg-base-300 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${course.progress}%` }}
                              ></div>
                  </div>
                </div>
              ))}
                      </div>
                    ) : (
                      <div className="bg-base-200 p-6 text-center rounded-lg">
                        <p className="text-base-content/70 mb-3">You haven't enrolled in any courses yet.</p>
                        <Link to="/" className="btn btn-primary btn-sm">Browse Courses</Link>
                      </div>
                    )}
            </div>

                  {/* Subject Performance */}
                    <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <BarChart size={18} />
                      Performance by Topic
                    </h3>
                    <div className="space-y-3">
                      {learningPatterns.subjectPerformance.map((subject, index) => (
                        <div key={index}>
                          <div className="flex justify-between items-center mb-1">
                            <span>{subject.name}</span>
                            <span className="text-sm font-medium">{subject.score}%</span>
                          </div>
                          <div className="w-full bg-base-300 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                subject.score >= 80 ? 'bg-success' : 
                                subject.score >= 60 ? 'bg-warning' : 'bg-error'
                              }`}
                              style={{ width: `${subject.score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Course Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Zap size={18} />
                      Recommended Next Courses
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      {isLoadingRecommendations ? (
                        <div className="flex justify-center items-center py-6">
                          <Loader className="animate-spin w-6 h-6 text-primary" />
                        </div>
                      ) : recommendedCourses.length > 0 ? (
                        recommendedCourses.map((course) => (
                          <div
                            key={course._id}
                            className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="relative h-32 bg-cover bg-center" 
                              style={{ backgroundImage: `url(${course.image})` }}>
                              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                              <div className="absolute top-2 right-2">
                                <span className="badge badge-sm bg-primary text-white border-0">
                                  {course.level}
                                </span>
                              </div>
                              <div className="absolute bottom-2 left-2">
                                <span className="text-white text-sm font-medium">
                                  {course.category}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {course.title}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2 line-clamp-2">{course.description}</p>
                              <div className="flex items-center text-xs text-gray-500 mb-2">
                                <Clock className="w-3 h-3 mr-1" />
                                <span>{course.duration}</span>
                                <User className="w-3 h-3 ml-3 mr-1" />
                                <span>{course.instructor}</span>
                              </div>
                              <div className="flex mt-2 space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate(`/courses/${course._id}`);
                                  }}
                                  className="flex-1 btn btn-primary"
                                >
                                  View Course
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 py-2 text-center text-sm">
                          No recommended courses available at this time.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "overview":
        return (
          <div className="space-y-8">
            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpenCheck size={20} />
                Course Progress
              </h2>
              <div className="space-y-6">
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course) => (
                    <div key={course.id} className="space-y-2 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition-colors" onClick={() => navigate(`/courses/${course.id}?tab=curriculum`)}>
                    <div className="flex justify-between items-center">
                        <h3 
                          className="font-medium hover:text-primary hover:underline"
                        >{course.title}</h3>
                      <span className="text-base-content/70 text-sm">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-base-300 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-base-content/70">Instructor: {course.instructor}</p>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-base-content/70">
                    <p>You haven't enrolled in any courses yet.</p>
                    <Link to="/" className="btn btn-primary mt-4">Browse Courses</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Trending Events */}
            <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp size={20} />
                  Trending Educational Topics
              </h2>
                <div className="flex items-center gap-2">
                  {lastUpdated && (
                    <span className="text-xs text-base-content/60">
                      Updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  <button 
                    className={`btn btn-sm btn-ghost ${loadingEvents ? 'loading' : ''}`}
                    onClick={fetchTrendingEvents}
                    disabled={loadingEvents}
                    aria-label="Refresh trending topics"
                  >
                    {!loadingEvents && <RefreshCw size={16} />}
                  </button>
                </div>
              </div>
              {loadingEvents ? (
                <div className="flex justify-center py-6">
                  <div className="loading loading-spinner text-primary"></div>
                </div>
              ) : (
              <div className="space-y-4">
                {trendingEvents.length > 0 ? (
                  <>
                    {trendingEvents.map(event => (
                      <div key={event.id} className="flex gap-4 items-start hover:bg-base-200 p-3 rounded-lg transition-colors">
                        {event.thumbnail ? (
                          <img 
                            src={event.thumbnail} 
                            alt={event.title} 
                            className="w-20 h-20 rounded-md object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen size={24} className="text-primary" />
                    </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary hover:underline line-clamp-2"
                            >
                              {event.title}
                            </a>
                            {event.source && (
                              <span className="badge badge-sm ml-2 flex-shrink-0">
                                {event.source}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-base-content/70 line-clamp-2 mt-1">{event.description}</p>
                          <div className="flex items-center text-xs text-base-content/60 mt-2">
                            {event.views && (
                              <div className="flex items-center">
                                <Eye size={12} className="mr-1" />
                                {event.views.toLocaleString()} views
                              </div>
                            )}
                            <div className="flex items-center ml-auto">
                              <Calendar size={12} className="mr-1" />
                              Trending today
                            </div>
                          </div>
                    </div>
                  </div>
                ))}
                    <div className="pt-2 text-center">
                      <a 
                        href="https://www.google.com/search?q=trending+educational+topics" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline"
                      >
                        View More Trends
                      </a>
              </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto mb-3 text-warning" size={24} />
                    <p className="text-base-content/70">No trending topics found</p>
                    <button 
                      className="btn btn-sm btn-primary mt-2"
                      onClick={fetchTrendingEvents}
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <User size={20} />
              Profile Settings
            </h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover"
                  />
                  <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full size-8 flex items-center justify-center">
                    <Settings size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-bold">{authUser?.fullName}</h3>
                <p className="text-base-content/70">{authUser?.email}</p>
                <div className="badge badge-primary">Student</div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input input-bordered w-full"
                    disabled={isUpdatingProfile}
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Email Address</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Your email"
                    defaultValue={authUser?.email}
                    className="input input-bordered w-full"
                    disabled
                  />
                </div>
                
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Bio</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
                    placeholder="Write something about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={isUpdatingProfile}
                  ></textarea>
                </div>
                
                <button 
                  className={`btn btn-primary ${isUpdatingProfile ? 'loading' : ''}`}
                  onClick={handleProfileUpdate}
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Saving...' : <><Save size={16} className="mr-2"/> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        );
      case "topics":
        return (
          <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen size={20} />
              Educational Topics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Topic cards */}
              <div className="card bg-base-200 hover:shadow-md transition-all">
                <div className="card-body">
                  <h3 className="card-title">Computer Science</h3>
                  <p>Algorithms, data structures, and programming concepts</p>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExploreTopic("Computer Science")}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-200 hover:shadow-md transition-all">
                <div className="card-body">
                  <h3 className="card-title">Mathematics</h3>
                  <p>Algebra, calculus, statistics, and mathematical reasoning</p>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExploreTopic("Mathematics")}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-200 hover:shadow-md transition-all">
                <div className="card-body">
                  <h3 className="card-title">Physics</h3>
                  <p>Mechanics, thermodynamics, and quantum physics</p>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExploreTopic("Physics")}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-200 hover:shadow-md transition-all">
                <div className="card-body">
                  <h3 className="card-title">Biology</h3>
                  <p>Cellular biology, genetics, and evolutionary principles</p>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExploreTopic("Biology")}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-200 hover:shadow-md transition-all">
                <div className="card-body">
                  <h3 className="card-title">Chemistry</h3>
                  <p>Organic chemistry, inorganic chemistry, and biochemistry</p>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExploreTopic("Chemistry")}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-200 hover:shadow-md transition-all">
                <div className="card-body">
                  <h3 className="card-title">Language Arts</h3>
                  <p>Writing skills, literature analysis, and communication</p>
                  <div className="card-actions justify-end mt-4">
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleExploreTopic("Language Arts")}
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "discussions":
        return (
          <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 h-[calc(80vh-10rem)]">
            <h2 className="text-xl font-bold p-4 border-b border-base-300 flex items-center gap-2">
              <MessageSquare size={20} />
              Class Discussions
            </h2>
            <div className="flex h-[calc(80vh-14rem)]">
              <Sidebar />
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="bg-base-100 p-6 rounded-xl shadow-sm border border-base-300">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings size={20} />
              App Settings
            </h2>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Theme Preferences</h3>
                <div className="flex items-center justify-between">
                  <span className="label-text text-base">Dark Mode</span>
                  <label className="cursor-pointer grid place-items-center">
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary bg-base-content row-start-1 col-start-1 col-span-2" 
                      checked={theme === 'dark'}
                      onChange={toggleTheme}
                    />
                    <Sun className="col-start-1 row-start-1 stroke-base-100 fill-base-100" />
                    <Moon className="col-start-2 row-start-1 stroke-base-100 fill-base-100" />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="label-text text-base">High Contrast</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-secondary"
                    checked={isHighContrast}
                    onChange={toggleHighContrast}
                  />
                </div>
              </div>
              
              <div className="divider"></div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Notification Settings</h3>
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Assignment Reminders</span>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
              </div>
              
              <div className="divider"></div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Privacy Settings</h3>
                <div className="flex items-center justify-between">
                  <span>Share Online Status</span>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Show Progress to Classmates</span>
                  <input type="checkbox" className="toggle toggle-primary" />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <div className="flex flex-col gap-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="size-8" />
              Student Dashboard
            </h1>
            <p className="text-base-content/70 mt-1">
              Welcome back, {authUser?.fullName || "Student"}
            </p>
          </div>
          
          <div className="stats shadow bg-base-100">
            <div className="stat">
              <div className="stat-figure text-primary">
                <BarChart className="size-6" />
              </div>
              <div className="stat-title">Current GPA</div>
              <div className="stat-value text-primary">8.8</div>
              <div className="stat-desc">Top 10% of class</div>
            </div>
          </div>
        </div>
        
        {/* Dashboard Tabs */}
        <div className="tabs tabs-bordered">
          <button 
            className={`tab tab-lg ${activeTab === "dashboard" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button 
            className={`tab tab-lg ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button 
            className={`tab tab-lg ${activeTab === "discussions" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("discussions")}
          >
            Discussions
          </button>
          <button 
            className={`tab tab-lg ${activeTab === "topics" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("topics")}
          >
            Topics
          </button>
          <button 
            className={`tab tab-lg ${activeTab === "profile" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button 
            className={`tab tab-lg ${activeTab === "settings" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>
        
        {/* Dashboard Content */}
        <div>
          {renderContent()}
        </div>
      </div>
      
      {/* Enrollment Success Modal */}
      {enrollmentSuccessModalOpen && currentlyEnrolledCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-base-100 rounded-lg p-6 shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="text-success" />
              Enrollment Successful
            </h3>
            <p className="mb-3">
              You have successfully enrolled in <span className="font-semibold">{currentlyEnrolledCourse.title}</span>.
            </p>
            <p className="text-base-content/70 mb-6">
              This course is now available in your enrolled courses. You can start learning right away!
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                className="btn btn-ghost"
                onClick={() => setEnrollmentSuccessModalOpen(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={goToEnrolledCourse}
              >
                Go to Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage; 