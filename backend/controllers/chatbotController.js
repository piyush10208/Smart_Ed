import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const processMessage = async (req, res) => {
  try {
    console.log("Received chatbot request:", req.body);
    const { message } = req.body;
    
    if (!message) {
      console.log("Missing message in request");
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log("Processing message:", message);
    console.log("Using API key:", process.env.OPENAI_API_KEY ? "API key exists" : "No API key");

    // Call OpenAI API to generate a response
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for an educational platform called SmartEdu. Provide concise and helpful responses to questions about courses, learning paths, and educational content. Keep responses brief and focused on education-related topics.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 150, // Keep responses concise
      temperature: 0.7, // Balance between creativity and focus
    });

    // Extract the assistant's message from the response
    const aiMessage = response.choices[0].message.content;
    console.log("Generated response:", aiMessage);

    return res.status(200).json({ message: aiMessage });
  } catch (error) {
    console.error('Error processing chatbot message:', error);
    return res.status(500).json({ 
      error: 'Failed to process message', 
      details: error.message 
    });
  }
};

export default {
  processMessage
}; 