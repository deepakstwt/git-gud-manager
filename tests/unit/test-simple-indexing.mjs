#!/usr/bin/env node

/**
 * Simple test for GitHub RAG indexing
 */

// Test with a small public repository
async function testIndexing() {
  console.log('🧪 Testing GitHub RAG Indexing...\n');

  try {
    // Import the indexing function
    const { indexGithubRepo } = await import('../../src/lib/github-rag-indexer.js');
    
    const testProjectId = 'test-project-123';
    const testRepo = 'https://github.com/octocat/Hello-World';  // Simple test repo
    
    console.log(`📂 Testing with repository: ${testRepo}`);
    console.log(`🆔 Project ID: ${testProjectId}\n`);
    
    const result = await indexGithubRepo(testProjectId, testRepo);
    
    console.log('📊 Results:');
    console.log(`   Success: ${result.success}`);
    console.log(`   Processed: ${result.processedCount}`);
    console.log(`   Skipped: ${result.skippedCount}`);
    console.log(`   Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

testIndexing().catch(console.error);
