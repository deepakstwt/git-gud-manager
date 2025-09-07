import { NextResponse } from 'next/server';
import { summarizeText } from '@/lib/ai';

export async function GET() {
  try {
    const testCommitData = `
feat: add user authentication system

Added login/logout functionality with JWT tokens
- Implemented user registration with email validation
- Added password hashing with bcrypt
- Created middleware for protected routes
- Updated database schema for user table
`;

    console.log('🤖 Testing AI summarization...');
    const summary = await summarizeText(testCommitData);
    
    return NextResponse.json({
      success: true,
      summary,
      message: 'AI summarization is working correctly!',
      isRealAI: !summary.includes('(AI analysis unavailable - using pattern detection)')
    });
  } catch (error) {
    console.error('AI Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'AI summarization failed'
    }, { status: 500 });
  }
}
