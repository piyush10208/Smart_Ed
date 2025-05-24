import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

// Course store to manage course enrollments and other course-related state
const useCourseStore = create((set, get) => ({
  // Empty array for courses the user enrolls in
  enrolledCourses: [],
  isLoading: false,
  error: null,
  
  // Fetch enrolled courses from backend
  fetchEnrolledCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/enrolled');
      if (response.data) {
        set({ enrolledCourses: response.data, isLoading: false });
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch enrolled courses';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Add a new course to enrolled courses
  enrollInCourse: async (course) => {
    set({ isLoading: true, error: null });
    try {
      // Check if already enrolled
      const isAlreadyEnrolled = get().enrolledCourses.some(c => c.courseId === course._id);
      if (isAlreadyEnrolled) {
        toast.error('You are already enrolled in this course');
        set({ isLoading: false });
        return;
      }

      const response = await axiosInstance.post('/enroll', {
        courseId: course._id,
        courseTitle: course.title,
        instructor: course.instructor
      });
      
      if (response.data) {
        set((state) => ({
          enrolledCourses: [...state.enrolledCourses, response.data],
          isLoading: false
        }));
        toast.success('Successfully enrolled in course!');
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Update progress for a specific course
  updateCourseProgress: async (courseId, progressIncrease) => {
    set({ isLoading: true, error: null });
    try {
      const currentCourse = get().enrolledCourses.find(c => c.courseId === courseId);
      if (!currentCourse) {
        throw new Error('Course not found in enrolled courses');
      }

      const newProgress = Math.min(100, currentCourse.progress + progressIncrease);
      
      const response = await axiosInstance.patch(`/course-progress/${courseId}`, {
        progress: newProgress
      });
      
      if (response.data) {
        set((state) => ({
          enrolledCourses: state.enrolledCourses.map(course => 
            course.courseId === courseId ? response.data : course
          ),
          isLoading: false
        }));
        toast.success(`Progress updated: +${progressIncrease}%`);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update course progress';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  // Get the count of enrolled courses
  getEnrolledCount: () => get().enrolledCourses.length,
}));

export default useCourseStore; 