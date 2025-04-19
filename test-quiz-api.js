const axios = require('axios');

async function testQuizAPI() {
  console.log('Testing Quiz API...');
  
  try {
    // Test the basic test endpoint
    console.log('Testing /api/quiz/test endpoint...');
    const testResponse = await axios.get('http://localhost:5001/api/quiz/test');
    console.log('Test Response:', testResponse.data);
    
    // Test quiz generation
    console.log('\nTesting /api/quiz/dev/generate endpoint...');
    const generateResponse = await axios.post('http://localhost:5001/api/quiz/dev/generate', {
      courseId: "test-course-1",
      moduleIndex: 0,
      moduleTitle: "Test Module",
      lessonTitle: "Test Lesson"
    });
    console.log('Generate Response:', generateResponse.data);
    
    const quizId = generateResponse.data._id;
    
    // Test quiz submission
    console.log('\nTesting /api/quiz/dev/submit endpoint...');
    const submitResponse = await axios.post('http://localhost:5001/api/quiz/dev/submit', {
      quizId,
      responses: [
        { questionId: 'q1', answer: 'Test Answer 1' },
        { questionId: 'q2', answer: 'Test Answer 2' },
        { questionId: 'q3', answer: 'Test Answer 3' },
        { questionId: 'q4', answer: 'Test Answer 4' },
        { questionId: 'q5', answer: 'Test Answer 5' }
      ]
    });
    console.log('Submit Response:', submitResponse.data);
    
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