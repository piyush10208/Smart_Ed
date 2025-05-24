import CourseProgress from "../models/courseProgress.model.js";

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, courseTitle, instructor } = req.body;
    const userId = req.user._id;

    // Check if already enrolled
    const existingProgress = await CourseProgress.findOne({ userId, courseId });
    if (existingProgress) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Create new course progress
    const courseProgress = new CourseProgress({
      userId,
      courseId,
      courseTitle,
      instructor,
      progress: 0,
      modules: [] // Will be populated when accessing course content
    });

    await courseProgress.save();

    res.status(201).json(courseProgress);
  } catch (error) {
    console.error("Error enrolling in course:", error);
    res.status(500).json({ message: "Failed to enroll in course" });
  }
};

// Get course progress
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const courseProgress = await CourseProgress.findOne({ userId, courseId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    res.status(200).json(courseProgress);
  } catch (error) {
    console.error("Error getting course progress:", error);
    res.status(500).json({ message: "Failed to get course progress" });
  }
};

// Update course progress
export const updateCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { progress, moduleIndex, lessonId } = req.body;
    const userId = req.user._id;

    const courseProgress = await CourseProgress.findOne({ userId, courseId });
    if (!courseProgress) {
      return res.status(404).json({ message: "Course progress not found" });
    }

    // Update overall progress
    if (progress !== undefined) {
      courseProgress.progress = Math.min(100, Math.max(0, progress));
    }

    // Update module progress
    if (moduleIndex !== undefined) {
      const module = courseProgress.modules.find(m => m.moduleIndex === moduleIndex);
      if (module) {
        module.completed = true;
        module.completedAt = new Date();
      }
    }

    // Update lesson progress
    if (lessonId !== undefined) {
      for (const module of courseProgress.modules) {
        const lesson = module.lessons.find(l => l.lessonId === lessonId);
        if (lesson) {
          lesson.completed = true;
          lesson.completedAt = new Date();
          break;
        }
      }
    }

    // Update last accessed timestamp
    courseProgress.lastAccessedAt = new Date();

    await courseProgress.save();

    res.status(200).json(courseProgress);
  } catch (error) {
    console.error("Error updating course progress:", error);
    res.status(500).json({ message: "Failed to update course progress" });
  }
};

// Get all enrolled courses for a user
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrolledCourses = await CourseProgress.find({ userId })
      .sort({ lastAccessedAt: -1 });

    res.status(200).json(enrolledCourses);
  } catch (error) {
    console.error("Error getting enrolled courses:", error);
    res.status(500).json({ message: "Failed to get enrolled courses" });
  }
}; 