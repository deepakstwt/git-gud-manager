#!/usr/bin/env node
/**
 * Direct test of AI functionality without authentication
 */

import { summarizeText } from './src/lib/ai.ts';

async function testAIDirectly() {
  try {
    console.log('🧪 Testing AI functionality directly...');
    console.log('='.repeat(50));
    
    const testCommitData = `
feat: add user authentication system

Added comprehensive login/logout functionality with JWT tokens:
- Implemented user registration with email validation
- Added password hashing with bcrypt for security
- Created middleware for protected routes
- Updated database schema to include user table
- Added session management with refresh tokens
- Integrated OAuth providers (Google, GitHub)
- Created user profile management interface

Files changed:
+ src/auth/login.js
+ src/auth/register.js
+ src/middleware/auth.js
+ src/models/User.js
+ src/routes/protected.js
~ package.json (added bcrypt, jsonwebtoken)
~ database/schema.sql (added users table)
`;

    console.log('📝 Test commit data:');
    console.log(testCommitData.substring(0, 200) + '...');
    console.log('='.repeat(50));
    
    console.log('🤖 Generating AI summary...');
    const summary = await summarizeText(testCommitData);
    
    console.log('✅ AI Summary Generated:');
    console.log('='.repeat(50));
    console.log(summary);
    console.log('='.repeat(50));
    
    // Check if it's a real AI summary or fallback
    if (summary.includes('(AI analysis unavailable - using pattern detection)')) {
      console.log('⚠️  Using fallback pattern detection - AI not working');
      return false;
    } else {
      console.log('🎉 AI summarization is working correctly!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ AI test failed:', error);
    return false;
  }
}

// Run the test
testAIDirectly().then(success => {
  if (success) {
    console.log('\n✅ AI functionality test PASSED');
  } else {
    console.log('\n❌ AI functionality test FAILED');
  }
  process.exit(success ? 0 : 1);
});
