import express from 'express';
import chatbotController from '../controllers/chatbotController.js';

const router = express.Router();

// Test endpoint to verify the route is working
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Ask me anything' });
});

// Process user message and generate AI response
router.post('/', chatbotController.processMessage);

export default router; 