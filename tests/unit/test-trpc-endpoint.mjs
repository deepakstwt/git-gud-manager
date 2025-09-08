import { createCaller } from '../../src/server/api/root';
import { createTRPCContext } from '../../src/server/api/trpc';

async function testProjectsEndpoint() {
  try {
    console.log('Testing tRPC projects endpoint...');
    
    // Create a context with a fake user ID for testing
    const mockHeaders = new Headers();
    const ctx = await createTRPCContext({ headers: mockHeaders });
    
    // Override the userId for testing (normally comes from Clerk)
    const testCtx = { ...ctx, userId: 'test-user-id' };
    
    const caller = createCaller(testCtx);
    
    // Test the endpoint
    console.log('Testing project.getProjects...');
    const projects = await caller.project.getProjects();
    console.log('Projects result:', projects);
    
  } catch (error) {
    console.error('tRPC test failed:', error);
    console.error('Error message:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testProjectsEndpoint();
