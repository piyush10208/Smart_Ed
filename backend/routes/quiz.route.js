import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { generateQuiz, submitQuizResponses, getQuizResults } from "../controllers/quiz.controller.js";

const router = express.Router();

// Test route without authentication
router.get("/test", (req, res) => {
  console.log("Quiz test route accessed");
  res.status(200).json({ message: "Quiz API is working!" });
});

// Development/testing routes without authentication
router.post("/dev/generate", async (req, res) => {
  console.log("Dev generate quiz route accessed", req.body);
  try {
    // Create a mock user for testing
    req.user = { _id: "dev-user-123" };
    return generateQuiz(req, res);
  } catch (error) {
    console.error("Error in dev/generate route:", error);
    return res.status(500).json({ message: "Server error in dev/generate route", error: error.message });
  }
});

router.post("/dev/submit", async (req, res) => {
  console.log("Dev submit quiz route accessed", req.body);
  try {
    // Create a mock user for testing
    req.user = { _id: "dev-user-123" };
    return submitQuizResponses(req, res);
  } catch (error) {
    console.error("Error in dev/submit route:", error);
    return res.status(500).json({ message: "Server error in dev/submit route", error: error.message });
  }
});

router.get("/dev/results/:quizId", async (req, res) => {
  console.log("Dev get quiz results route accessed", req.params);
  try {
    // Create a mock user for testing
    req.user = { _id: "dev-user-123" };
    return getQuizResults(req, res);
  } catch (error) {
    console.error("Error in dev/results route:", error);
    return res.status(500).json({ message: "Server error in dev/results route", error: error.message });
  }
});

// Regular authenticated routes
router.post("/generate", protectRoute, generateQuiz);
router.post("/submit", protectRoute, submitQuizResponses);
router.get("/results/:quizId", protectRoute, getQuizResults);

export default router; 