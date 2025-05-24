import CourseProgress from '../models/course-progress.model.js';

// Get all enrolled courses for the current user
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const enrolledCourses = await CourseProgress.find({ userId });
    res.status(200).json(enrolledCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ message: 'Failed to fetch enrolled courses' });
  }
};

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, courseTitle, instructor } = req.body;

    // Check if already enrolled
    const existingEnrollment = await CourseProgress.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Create new enrollment
    const courseProgress = new CourseProgress({
      userId,
      courseId,
      courseTitle,
      instructor,
      progress: 0
    });

    await courseProgress.save();
    res.status(201).json(courseProgress);
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Failed to enroll in course' });
  }
};

// Update course progress
export const updateCourseProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { progress } = req.body;

    const courseProgress = await CourseProgress.findOne({ userId, courseId });
    if (!courseProgress) {
      return res.status(404).json({ message: 'Course enrollment not found' });
    }

    courseProgress.progress = progress;
    await courseProgress.save();

    res.status(200).json(courseProgress);
  } catch (error) {
    console.error('Error updating course progress:', error);
    res.status(500).json({ message: 'Failed to update course progress' });
  }
}; 