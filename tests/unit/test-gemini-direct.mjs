#!/usr/bin/env node

/**
 * Direct test of Gemini API without environment module imports
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testGeminiDirect() {
  try {
    console.log('🧪 Testing Gemini API directly...');
    console.log('='.repeat(50));
    
    // Use the API key directly
    const GEMINI_API_KEY = 'AIzaSyBPsRtpwzckThgsIwX-rfmZX2wCnEbToCY';
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    
    console.log('🔑 API Key found, initializing Gemini...');
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const testCommitData = `
feat: add user authentication system

Added comprehensive login/logout functionality with JWT tokens:
- Implemented user registration with email validation
- Added password hashing with bcrypt for security
- Created middleware for protected routes
- Updated database schema to include user table
`;

    console.log('📝 Test commit data prepared');
    console.log('='.repeat(50));
    
    const prompt = `
Analyze this Git commit and provide a concise, helpful summary. Focus on:
1. What type of change this is (feature, bugfix, refactor, etc.)
2. The main purpose and impact of the changes
3. Any important technical details

Keep the summary under 150 words and use a professional, informative tone.

Commit data:
${testCommitData}
`;

    console.log('🤖 Sending request to Gemini AI...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    console.log('✅ AI Summary Generated:');
    console.log('='.repeat(50));
    console.log(summary);
    console.log('='.repeat(50));
    
    // Check if it's a real AI summary
    if (summary.includes('(AI analysis unavailable') || summary.includes('pattern detection')) {
      console.log('⚠️  Still getting fallback - there might be an issue');
      return false;
    } else {
      console.log('🎉 Gemini AI is working correctly!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Gemini test failed:', error);
    console.error('Error details:', error.message);
    return false;
  }
}

// Run the test
testGeminiDirect().then(success => {
  if (success) {
    console.log('\n✅ SOLUTION: Gemini AI is working - the issue is in the integration');
  } else {
    console.log('\n❌ ISSUE: Gemini API is not working properly');
  }
  process.exit(success ? 0 : 1);
}).catch(console.error);
