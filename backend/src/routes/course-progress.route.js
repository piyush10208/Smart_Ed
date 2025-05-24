import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  enrollInCourse,
  updateCourseProgress,
  getEnrolledCourses
} from '../controllers/course-progress.controller.js';

const router = express.Router();

// All routes are protected
router.use(protectRoute);

// Get all enrolled courses
router.get('/enrolled', getEnrolledCourses);

// Enroll in a course
router.post('/enroll', enrollInCourse);

// Update course progress
router.patch('/:courseId', updateCourseProgress);

export default router; 