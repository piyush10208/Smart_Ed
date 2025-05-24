import express from "express";
import { 
  enrollInCourse, 
  getCourseProgress, 
  updateCourseProgress, 
  getEnrolledCourses 
} from "../controllers/courseProgress.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Enroll in a course
router.post("/enroll", enrollInCourse);

// Get all enrolled courses for the user
router.get("/enrolled", getEnrolledCourses);

// Get progress for a specific course
router.get("/:courseId", getCourseProgress);

// Update progress for a specific course
router.patch("/:courseId", updateCourseProgress);

export default router; 