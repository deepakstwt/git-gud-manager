#!/usr/bin/env node
/**
 * Standalone test of AI functionality with proper environment loading
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAIStandalone() {
  try {
    console.log('🧪 Testing AI functionality with proper environment...');
    console.log('='.repeat(50));
    
    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
      return false;
    }
    
    console.log('✅ Found GEMINI_API_KEY');
    console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');
    
    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const testCommitData = `
feat: add user authentication system

Added comprehensive login/logout functionality with JWT tokens:
- Implemented user registration with email validation
- Added password hashing with bcrypt for security
- Created middleware for protected routes
- Updated database schema to include user table
- Added session management with refresh tokens
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
    
    console.log('🎉 AI summarization is working correctly!');
    return true;
    
  } catch (error) {
    console.error('❌ AI test failed:', error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      console.log('💡 The API key might be invalid or expired');
    } else if (error.message?.includes('SAFETY')) {
      console.log('💡 Content was blocked by safety filters');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      console.log('💡 API quota exceeded for today');
    }
    
    return false;
  }
}

// Run the test
testAIStandalone().then(success => {
  if (success) {
    console.log('\n✅ AI functionality test PASSED');
  } else {
    console.log('\n❌ AI functionality test FAILED');
  }
  process.exit(success ? 0 : 1);
});
