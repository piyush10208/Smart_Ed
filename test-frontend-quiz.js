const axios = require('axios');

async function testFrontendQuiz() {
  console.log('Testing Frontend Quiz API Integration...');
  
  // Using the same base URL that frontend would use
  const baseURL = 'http://localhost:5001/api';
  
  try {
    // Step 1: Generate a quiz
    console.log('\n1. Generating a quiz...');
    const generateResponse = await axios.post(`${baseURL}/quiz/dev/generate`, {
      courseId: "test-course-1",
      moduleIndex: 0,
      moduleTitle: "Test Module",
      lessonTitle: "Test Lesson"
    });
    
    console.log('Quiz generated successfully!');
    console.log('Quiz ID:', generateResponse.data._id);
    
    const quizId = generateResponse.data._id;
    const questions = generateResponse.data.questions;
    
    // Format responses as the frontend would
    const selectedAnswers = {};
    // Simulate user selecting answers (just pick the first option for each question)
    questions.forEach(question => {
      selectedAnswers[question.id] = question.options[0];
    });
    
    // Format responses as the frontend would
    const responses = Object.entries(selectedAnswers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));
    
    console.log('\n2. Formatted responses:');
    console.log(responses);
    
    // Step 2: Submit the quiz
    console.log('\n3. Submitting the quiz...');
    console.log('Request payload:', { quizId, responses });
    
    const submitResponse = await axios.post(`${baseURL}/quiz/dev/submit`, {
      quizId,
      responses
    });
    
    console.log('\nSubmit response:', submitResponse.data);
    console.log('\nQuiz submission test completed successfully!');
    
  } catch (error) {
    console.error('\nError testing quiz submission:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Network issue or server not running.');
    } else {
      console.error('Error details:', error);
    }
  }
}

testFrontendQuiz(); 