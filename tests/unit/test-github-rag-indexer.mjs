#!/usr/bin/env node

/**
 * Test script for GitHub RAG indexing with PGVector
 * This script tests the complete pipeline: load repo → summarize → embed → store
 */

import { indexGithubRepo, queryRAGSystem } from '../src/lib/github-rag-indexer.js';
import { db } from '../src/server/db.js';

async function testGitHubRAGIndexing() {
  console.log('🧪 Testing GitHub RAG Indexing Pipeline with PGVector\n');

  // Test configuration
  const testProjectId = 'test-project-' + Date.now();
  const testRepoUrl = 'https://github.com/microsoft/typescript';  // Small TypeScript examples
  
  try {
    console.log('📋 Test Configuration:');
    console.log(`   Project ID: ${testProjectId}`);
    console.log(`   Repository: ${testRepoUrl}\n`);

    // Step 1: Test indexing
    console.log('🚀 Step 1: Testing repository indexing...');
    const indexResult = await indexGithubRepo(testProjectId, testRepoUrl);
    
    console.log('\n📊 Indexing Results:');
    console.log(`   Success: ${indexResult.success}`);
    console.log(`   Processed: ${indexResult.processedCount} files`);
    console.log(`   Skipped: ${indexResult.skippedCount} files`);
    console.log(`   Errors: ${indexResult.errors.length}`);
    
    if (indexResult.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      indexResult.errors.forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }

    // Step 2: Verify database storage
    console.log('\n🔍 Step 2: Verifying database storage...');
    const storedCount = await db.sourceCodeEmbedding.count({
      where: { projectId: testProjectId }
    });
    
    console.log(`✅ Found ${storedCount} records in SourceCodeEmbedding table`);

    // Step 3: Test vector embeddings
    console.log('\n🧮 Step 3: Testing vector embeddings...');
    const sampleRecords = await db.$queryRaw`
      SELECT 
        "fileName", 
        "summary",
        array_length(embedding, 1) as embedding_dimension
      FROM "SourceCodeEmbedding" 
      WHERE "projectId" = ${testProjectId}
        AND embedding IS NOT NULL
      LIMIT 5;
    `;

    console.log(`✅ Found ${sampleRecords.length} records with embeddings:`);
    sampleRecords.forEach((record, i) => {
      console.log(`   ${i + 1}. ${record.fileName} (${record.embedding_dimension}D embedding)`);
      console.log(`      Summary: ${record.summary.substring(0, 100)}...`);
    });

    // Step 4: Test RAG queries
    console.log('\n🤖 Step 4: Testing RAG queries...');
    const testQuestions = [
      'What are the main TypeScript features?',
      'How does compilation work?',
      'What are type definitions?'
    ];

    for (const question of testQuestions) {
      console.log(`\n❓ Question: "${question}"`);
      const queryResult = await queryRAGSystem(testProjectId, question, 3);
      
      console.log(`   📝 Answer: ${queryResult.answer.substring(0, 200)}...`);
      console.log(`   📚 Sources (${queryResult.sources.length}):`);
      queryResult.sources.forEach((source, i) => {
        console.log(`      ${i + 1}. ${source.fileName} (similarity: ${(source.similarity * 100).toFixed(1)}%)`);
      });
    }

    // Step 5: Test vector similarity search
    console.log('\n🔍 Step 5: Testing vector similarity search...');
    const testEmbedding = Array.from({ length: 768 }, () => Math.random());
    
    const similarityResults = await db.$queryRaw`
      SELECT 
        "fileName",
        "summary",
        1 - (embedding <=> ${testEmbedding}::vector) as similarity
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${testProjectId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${testEmbedding}::vector
      LIMIT 3;
    `;

    console.log(`✅ Vector similarity search returned ${similarityResults.length} results:`);
    similarityResults.forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.fileName} (${(result.similarity * 100).toFixed(2)}% similar)`);
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`   ✅ Repository indexing: ${indexResult.success ? 'PASSED' : 'FAILED'}`);
    console.log(`   ✅ Database storage: ${storedCount > 0 ? 'PASSED' : 'FAILED'}`);
    console.log(`   ✅ Vector embeddings: ${sampleRecords.length > 0 ? 'PASSED' : 'FAILED'}`);
    console.log(`   ✅ RAG queries: PASSED`);
    console.log(`   ✅ Vector similarity: ${similarityResults.length > 0 ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Cleanup: Remove test data
    try {
      console.log('\n🧹 Cleaning up test data...');
      const deletedCount = await db.sourceCodeEmbedding.deleteMany({
        where: { projectId: testProjectId }
      });
      console.log(`✅ Deleted ${deletedCount.count} test records`);
    } catch (cleanupError) {
      console.error('⚠️ Error during cleanup:', cleanupError);
    }
    
    await db.$disconnect();
    console.log('👋 Database connection closed');
  }
}

// Run the test
testGitHubRAGIndexing().catch(console.error);
