import { NextRequest, NextResponse } from 'next/server';
import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing API route...');
    
    const ctx = await createTRPCContext({ headers: request.headers });
    console.log('Context created, userId:', ctx.userId);
    
    if (!ctx.userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const caller = createCaller(ctx);
    const projects = await caller.project.getProjects();
    
    return NextResponse.json({ success: true, projects });
  } catch (error: any) {
    console.error('API test error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Unknown error',
      stack: error?.stack 
    }, { status: 500 });
  }
}
