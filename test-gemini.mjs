#!/usr/bin/env node

// Simple test to verify Gemini AI is working
// This will test the AI connection directly

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyDzxRi58vcz5XlOSXFT4mv0q7fNgEpuIMU';

async function testGeminiAPI() {
  try {
    console.log('🤖 Testing Gemini AI connection...');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const testPrompt = `
Analyze this Git commit and provide a concise summary:

COMMIT: abc1234
MESSAGE: fix: resolve memory leak in user authentication component
AUTHOR: John Doe
DATE: 2025-01-01T10:00:00Z
STATS: +5 -12 (2 files)

FILES CHANGED:
- src/auth/UserAuth.js (modified) +3 -8
- src/auth/AuthToken.js (modified) +2 -4

Please provide a brief technical summary.
`;
    
    console.log('📤 Sending test request to Gemini...');
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const summary = response.text();
    
    console.log('\n✅ Gemini AI Test Successful!');
    console.log('📋 Generated Summary:');
    console.log('='.repeat(60));
    console.log(summary);
    console.log('='.repeat(60));
    
    return true;
  } catch (error) {
    console.error('\n❌ Gemini AI Test Failed:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('💡 The API key might be invalid or expired');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('💡 Check if the Gemini API is enabled for your account');
    } else if (error.message.includes('quota')) {
      console.log('💡 You might have exceeded your API quota');
    }
    
    return false;
  }
}

testGeminiAPI();
