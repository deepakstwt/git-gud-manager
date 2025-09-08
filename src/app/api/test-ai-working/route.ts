import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing AI functionality through API...');
    
    // Import the AI library
    const { summarizeText } = await import('@/lib/ai');
    
    const testCommitData = `
feat: add user authentication system

Added comprehensive login/logout functionality with JWT tokens:
- Implemented user registration with email validation
- Added password hashing with bcrypt for security
- Created middleware for protected routes
- Updated database schema to include user table
`;

    console.log('🤖 Generating AI summary...');
    const summary = await summarizeText(testCommitData);
    
    const isAIWorking = !summary.includes('Fallback:') && !summary.includes('pattern analysis');
    
    console.log(`✅ AI Summary Result: ${summary.substring(0, 100)}...`);
    
    return NextResponse.json({
      success: true,
      aiWorking: isAIWorking,
      summary,
      message: isAIWorking ? 'AI is working correctly!' : 'AI fallback is being used'
    });
    
  } catch (error) {
    console.error('❌ AI test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'AI test failed'
    }, { status: 500 });
  }
}
