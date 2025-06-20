# SmartEdu Platform

A full-stack educational platform with course management, quiz functionality, and AI-powered features.

## Features

- **Course Management**: Browse and enroll in educational courses
- **Interactive Quizzes**: Take quizzes and get immediate feedback
- **Wikipedia Integration**: Search Wikipedia for additional information on lesson topics
- **AI Chatbot Assistant**: Get help from our AI assistant on any page

## AI Chatbot

The platform includes an AI-powered chatbot that uses OpenAI's GPT model to answer questions about:
- Course content
- Learning paths
- Educational resources
- General assistance with the platform

### Using the Chatbot

1. Look for the chat icon in the bottom right corner of any page
2. Click the icon to open the chat window
3. Type your question and press Enter or click the Send button
4. The AI will generate a helpful response
5. You can minimize the chat window or close it at any time

### Technical Implementation

The chatbot consists of:
- Frontend component that appears on all pages
- Backend API endpoint that communicates with OpenAI
- Secure handling of API keys through environment variables

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   ```
3. Create a `.env` file in the backend directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Start the backend:
   ```
   cd backend && npm run dev
   ```
5. Start the frontend:
   ```
   cd frontend && npm run dev
   ```

## License

MIT
#   s m a r t _ e d  
 #   s m a r t _ e d  
 