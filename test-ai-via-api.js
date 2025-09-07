#!/usr/bin/env node
/**
 * Test AI functionality by calling the tRPC endpoint directly
 */

async function testAIFunctionality() {
  try {
    console.log('🧪 Testing AI functionality through tRPC endpoint...');
    
    // Make a request to test the poll commits functionality
    const projectId = 'cmf8nx05w0000phzundstoxgb'; // From the logs, this seems to be a valid project ID
    
    const response = await fetch('http://localhost:3000/api/trpc/project.pollCommits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: { projectId }
      })
    });
    
    const result = await response.json();
    console.log('📊 Poll Commits Result:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('❌ Error from API:', result.error);
    } else {
      console.log('✅ AI polling completed');
      if (result.result?.data?.processed > 0) {
        console.log(`🎉 Successfully processed ${result.result.data.processed} commits with AI summaries`);
      } else {
        console.log('ℹ️ No new commits to process');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAIFunctionality();
