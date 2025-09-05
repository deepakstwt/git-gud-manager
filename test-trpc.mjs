import { createCaller } from './src/server/api/root.js';
import { createTRPCContext } from './src/server/api/trpc.js';

async function testTRPC() {
  try {
    console.log('Testing tRPC setup...');
    
    // Create a mock context
    const ctx = await createTRPCContext({
      headers: new Headers(),
    });
    
    console.log('Context created:', { hasDb: !!ctx.db, userId: ctx.userId });
    
    // Create a caller
    const caller = createCaller(ctx);
    
    // Test the public procedure first
    const testResult = await caller.project.test();
    console.log('Test endpoint result:', testResult);
    
  } catch (error) {
    console.error('tRPC test failed:', error);
    console.error('Error stack:', error.stack);
  }
}

testTRPC();
