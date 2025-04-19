import { create } from 'zustand';

// Student store to manage student data
const useStudentStore = create((set, get) => ({
  // Student statistics
  studentStats: {
    overallProgress: 0,
    totalHoursSpent: 0,
    completedAssignments: 0,
    totalAssignments: 0,
    strengths: [],
    weaknesses: []
  },
  // Learning pattern data for visualization
  learningPatterns: {
    weekdayActivity: [0, 0, 0, 0, 0, 0, 0], // Sunday to Saturday
    hourlyActivity: Array(24).fill(0), // 24 hours
    subjectPerformance: [] // Subject-wise performance
  },
  isLoading: false,
  error: null,
  
  // Fetch student data (in a real app, this would call an API)
  fetchStudentData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock student statistics
      const mockStudentStats = {
        overallProgress: 72,
        totalHoursSpent: 148,
        completedAssignments: 32,
        totalAssignments: 45,
        strengths: ["Mathematics", "Data Structures", "Algorithms"],
        weaknesses: ["Physics", "Frontend Development"]
      };
      
      // Mock learning patterns
      const mockLearningPatterns = {
        weekdayActivity: [5, 20, 15, 25, 18, 10, 7], // Sunday to Saturday
        hourlyActivity: [
          1, 0, 0, 0, 0, 0, 2, 5, 10, 15, 20, 18,  // 12am to 12pm
          16, 18, 20, 15, 12, 8, 5, 3, 2, 1, 1, 0   // 12pm to 12am
        ],
        subjectPerformance: [
          { name: "Mathematics", score: 92 },
          { name: "Computer Science", score: 88 },
          { name: "Physics", score: 65 },
          { name: "Data Science", score: 78 },
          { name: "Web Development", score: 70 }
        ]
      };
      
      set({
        studentStats: mockStudentStats,
        learningPatterns: mockLearningPatterns,
        isLoading: false
      });
    } catch (error) {
      set({ error: "Failed to fetch student data", isLoading: false });
    }
  },
  
  // Update student stats
  updateStudentStats: (newStats) => {
    set(state => ({
      studentStats: {
        ...state.studentStats,
        ...newStats
      }
    }));
  }
}));

export default useStudentStore; 