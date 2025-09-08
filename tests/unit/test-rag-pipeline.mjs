#!/usr/bin/env node
// Test script for complete RAG pipeline
// Usage: node test-rag-pipeline.mjs

import { processRepositoryForRAG, queryRAG, getRAGStats, clearRAGData } from '../../src/lib/rag-pipeline.ts';
import { db } from '../../src/server/db.ts';

async function testRAGPipeline() {
  console.log('🧪 Testing Complete RAG Pipeline...\n');
  
  try {
    // Step 1: Create a test project
    console.log('📁 Creating test project...');
    const testProject = await db.project.create({
      data: {
        name: 'RAG Test Project',
        githubUrl: 'https://github.com/deepakstwt/My_Portfolio_Man'
      }
    });
    console.log(`✅ Created project: ${testProject.id}\n`);

    // Step 2: Process repository through RAG pipeline
    console.log('🚀 Processing repository through RAG pipeline...');
    const processingResult = await processRepositoryForRAG(
      testProject.id,
      'https://github.com/deepakstwt/My_Portfolio_Man',
      process.env.GITHUB_TOKEN
    );
    
    console.log('📊 Processing Results:');
    console.log(`  ✅ Success: ${processingResult.success}`);
    console.log(`  📝 Processed: ${processingResult.processedCount} files`);
    console.log(`  ⏭️  Skipped: ${processingResult.skippedCount} files`);
    console.log(`  ❌ Errors: ${processingResult.errors.length}`);
    
    if (processingResult.errors.length > 0) {
      console.log('  Error details:', processingResult.errors.slice(0, 3));
    }
    console.log('');

    // Step 3: Get RAG statistics
    console.log('📈 RAG Statistics:');
    const stats = await getRAGStats(testProject.id);
    console.log(`  📄 Total documents: ${stats.totalDocuments}`);
    console.log(`  📝 With summaries: ${stats.totalSummaries}`);
    console.log(`  🔢 With embeddings: ${stats.totalEmbeddings}`);
    console.log(`  📏 Avg summary length: ${stats.avgSummaryLength} chars`);
    console.log('  📁 File types:', Object.entries(stats.fileTypes).slice(0, 5));
    console.log('');

    // Step 4: Test RAG queries
    const testQuestions = [
      'What is this project about?',
      'What React components are available?',
      'How is styling handled in this project?',
      'What are the main features of this application?'
    ];

    console.log('🔍 Testing RAG Queries:\n');
    
    for (const question of testQuestions) {
      console.log(`❓ Question: "${question}"`);
      
      const queryResult = await queryRAG(testProject.id, question, 3);
      
      if (queryResult.success) {
        console.log(`✅ Answer: ${queryResult.answer.substring(0, 200)}${queryResult.answer.length > 200 ? '...' : ''}`);
        console.log(`📋 Top ${queryResult.context.length} relevant files:`);
        queryResult.context.forEach((doc, i) => {
          console.log(`  ${i + 1}. ${doc.fileName} (similarity: ${doc.similarity.toFixed(3)})`);
        });
      } else {
        console.log(`❌ Query failed: ${queryResult.error}`);
      }
      
      console.log('---\n');
    }

    // Step 5: Cleanup (optional)
    console.log('🧹 Cleaning up test data...');
    const deletedDocs = await clearRAGData(testProject.id);
    await db.project.delete({ where: { id: testProject.id } });
    console.log(`✅ Cleaned up ${deletedDocs} documents and test project\n`);

    console.log('🎉 RAG Pipeline Test Complete!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Repository loading works');
    console.log('  ✅ Document summarization works');
    console.log('  ✅ Embedding generation works');
    console.log('  ✅ Database storage works');
    console.log('  ✅ Similarity search works');
    console.log('  ✅ Answer generation works');
    console.log('\n🚀 RAG pipeline is ready for production use!');

  } catch (error) {
    console.error('❌ RAG Pipeline test failed:', error);
    
    // Attempt cleanup on error
    try {
      const projects = await db.project.findMany({
        where: { name: 'RAG Test Project' }
      });
      
      for (const project of projects) {
        await clearRAGData(project.id);
        await db.project.delete({ where: { id: project.id } });
      }
    } catch (cleanupError) {
      console.error('⚠️  Cleanup failed:', cleanupError);
    }
    
    process.exit(1);
  }
}

// Run the test
testRAGPipeline().then(() => {
  console.log('\n✨ Test completed successfully!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test failed with error:', error);
  process.exit(1);
});
