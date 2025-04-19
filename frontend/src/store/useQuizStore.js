import { create } from 'zustand';

// Quiz store to manage quiz data
const useQuizStore = create((set, get) => ({
  // Store quiz attempts and performance statistics
  quizAttempts: [],
  quizStats: {
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    recentQuizzes: []
  },
  isLoading: false,
  error: null,
  
  // Add a new quiz attempt
  addQuizAttempt: (quiz) => {
    set((state) => {
      const newAttempts = [...state.quizAttempts, quiz];
      
      // Calculate new statistics
      const totalAttempts = newAttempts.length;
      const totalScore = newAttempts.reduce((sum, quiz) => sum + quiz.score, 0);
      const averageScore = totalScore / totalAttempts;
      const bestScore = Math.max(...newAttempts.map(quiz => quiz.score));
      
      // Get 5 most recent quizzes
      const recentQuizzes = [...newAttempts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      return {
        quizAttempts: newAttempts,
        quizStats: {
          totalAttempts,
          averageScore,
          bestScore,
          recentQuizzes
        }
      };
    });
  },
  
  // Fetch quiz data (in a real app, this would call an API)
  fetchQuizData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock quiz attempts
      const mockQuizAttempts = [
        { id: 1, title: "Python Basics", score: 85, totalQuestions: 10, date: "2023-04-10T14:30:00" },
        { id: 2, title: "Advanced Mathematics", score: 92, totalQuestions: 15, date: "2023-04-12T10:15:00" },
        { id: 3, title: "Web Development", score: 78, totalQuestions: 12, date: "2023-04-14T16:45:00" },
        { id: 4, title: "Data Structures", score: 95, totalQuestions: 10, date: "2023-04-15T09:20:00" },
        { id: 5, title: "Physics Fundamentals", score: 88, totalQuestions: 15, date: "2023-04-16T11:30:00" }
      ];
      
      // Calculate statistics
      const totalAttempts = mockQuizAttempts.length;
      const totalScore = mockQuizAttempts.reduce((sum, quiz) => sum + quiz.score, 0);
      const averageScore = totalScore / totalAttempts;
      const bestScore = Math.max(...mockQuizAttempts.map(quiz => quiz.score));
      
      // Get 5 most recent quizzes
      const recentQuizzes = [...mockQuizAttempts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      
      set({
        quizAttempts: mockQuizAttempts,
        quizStats: {
          totalAttempts,
          averageScore,
          bestScore,
          recentQuizzes
        },
        isLoading: false
      });
    } catch (error) {
      set({ error: "Failed to fetch quiz data", isLoading: false });
    }
  }
}));

export default useQuizStore; 