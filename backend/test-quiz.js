import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

async function testQuizAPI() {
  console.log('Testing Quiz API...');
  
  try {
    // Test the basic test endpoint
    console.log('\n1. Testing /quiz/test endpoint...');
    const testResponse = await axios.get(`${API_URL}/quiz/test`);
    console.log('Test Response:', testResponse.data);
    
    // Test quiz generation
    console.log('\n2. Testing /quiz/dev/generate endpoint...');
    const generateResponse = await axios.post(`${API_URL}/quiz/dev/generate`, {
      courseId: "test-course-1",
      moduleIndex: 0,
      moduleTitle: "Test Module",
      lessonTitle: "Test Lesson"
    });
    console.log('Quiz generated successfully!');
    console.log('Quiz ID:', generateResponse.data._id);
    console.log('Total Questions:', generateResponse.data.totalQuestions);
    
    const quizId = generateResponse.data._id;
    
    // Generate mock responses
    const mockResponses = generateResponse.data.questions.map(question => ({
      questionId: question.id,
      answer: question.options[Math.floor(Math.random() * question.options.length)]
    }));
    
    // Test quiz submission
    console.log('\n3. Testing /quiz/dev/submit endpoint...');
    const submitResponse = await axios.post(`${API_URL}/quiz/dev/submit`, {
      quizId,
      responses: mockResponses
    });
    console.log('Quiz submitted successfully!');
    console.log('Score:', submitResponse.data.score, '/', submitResponse.data.totalQuestions);
    console.log('Percentage:', submitResponse.data.percentage + '%');
    
    // Test getting quiz results
    console.log('\n4. Testing /quiz/dev/results endpoint...');
    const resultsResponse = await axios.get(`${API_URL}/quiz/dev/results/${quizId}`);
    console.log('Quiz results retrieved successfully!');
    console.log('Score:', resultsResponse.data.score, '/', resultsResponse.data.totalQuestions);
    
    console.log('\nAPI Tests completed successfully!');
  } catch (error) {
    console.error('Error testing API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testQuizAPI(); 