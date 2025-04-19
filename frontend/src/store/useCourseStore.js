import { create } from 'zustand';

// Course store to manage course enrollments and other course-related state
const useCourseStore = create((set, get) => ({
  // Empty array for courses the user enrolls in
  enrolledCourses: [],
  
  // Add a new course to enrolled courses
  enrollInCourse: (course) => {
    set((state) => ({
      enrolledCourses: [...state.enrolledCourses, {
        id: state.enrolledCourses.length + 1,
        title: course.title,
        progress: 0,
        instructor: course.instructor
      }]
    }));
  },
  
  // Update progress for a specific course
  updateCourseProgress: (courseTitle, completedValue) => {
    set((state) => ({
      enrolledCourses: state.enrolledCourses.map(course => {
        if (course.title === courseTitle) {
          // Calculate new progress based on completed value
          // For simplicity, the completedValue is a percentage to add
          const newProgress = Math.min(100, course.progress + completedValue);
          return { ...course, progress: newProgress };
        }
        return course;
      })
    }));
  },
  
  // Get the count of enrolled courses
  getEnrolledCount: () => get().enrolledCourses.length,
}));

export default useCourseStore; 