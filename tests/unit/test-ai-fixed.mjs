#!/usr/bin/env node

/**
 * Test the fixed AI summarization in the application context
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAIInContext() {
  try {
    console.log('🧪 Testing AI summarization with application context...');
    console.log('='.repeat(60));
    
    // Import the AI library with the fixes
    const { summarizeText } = await import('../../src/lib/ai.js');
    
    const testCommitData = `
feat: add user authentication system

Added comprehensive login/logout functionality with JWT tokens:
- Implemented user registration with email validation
- Added password hashing with bcrypt for security
- Created middleware for protected routes
- Updated database schema to include user table
`;

    console.log('📝 Testing with sample commit data...');
    const summary = await summarizeText(testCommitData);
    
    console.log('✅ AI Summary Result:');
    console.log('='.repeat(60));
    console.log(summary);
    console.log('='.repeat(60));
    
    // Check if it's using fallback
    if (summary.includes('Fallback:') || summary.includes('pattern analysis')) {
      console.log('⚠️  Still using fallback - check environment variable loading');
      return false;
    } else {
      console.log('🎉 AI is working correctly in application context!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

testAIInContext().then(success => {
  process.exit(success ? 0 : 1);
});
