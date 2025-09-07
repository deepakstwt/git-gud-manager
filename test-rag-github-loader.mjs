#!/usr/bin/env node
// Test script to verify GitHub repository loader for RAG pipeline
// Usage: node test-rag-github-loader.mjs

import { loadGitHubRepository } from './src/lib/github-loader.ts';

async function testRAGGitHubLoader() {
  console.log('🧪 Testing GitHub Repository Loader for RAG Pipeline...\n');
  
  try {
    // Load a small public repository
    const docs = await loadGitHubRepository(
      "https://github.com/deepakstwt/My_Portfolio_Man", 
      process.env.GITHUB_TOKEN
    );
    
    console.log(`✅ Loaded ${docs.length} documents for RAG pipeline\n`);
    
    // Show document structure (first 3 docs)
    console.log('📋 Document Structure (first 3 documents):');
    docs.slice(0, 3).forEach((doc, index) => {
      console.log(`\n  Document ${index + 1}:`);
      console.log(`    📄 Source: ${doc.metadata.source}`);
      console.log(`    📝 Content length: ${doc.pageContent.length} characters`);
      console.log(`    🔍 Content preview: "${doc.pageContent.substring(0, 100)}${doc.pageContent.length > 100 ? '...' : ''}"`);
    });
    
    // Verify document format for RAG
    const firstDoc = docs[0];
    console.log('\n🎯 RAG Document Format Verification:');
    console.log(`✅ pageContent exists: ${!!firstDoc.pageContent}`);
    console.log(`✅ metadata.source exists: ${!!firstDoc.metadata?.source}`);
    console.log(`✅ Ready for vector embeddings: ${typeof firstDoc.pageContent === 'string'}`);
    
    console.log('\n🚀 Next Steps for RAG Pipeline:');
    console.log('  1. Split documents into chunks');
    console.log('  2. Generate embeddings for each chunk');
    console.log('  3. Store in vector database (e.g., Pinecone, Weaviate)');
    console.log('  4. Use for retrieval + LLM queries');
    
    return docs;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRAGGitHubLoader().then(() => {
  console.log('\n🎉 GitHub Repository Loader is ready for RAG pipeline!');
});
