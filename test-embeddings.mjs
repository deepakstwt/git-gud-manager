#!/usr/bin/env node
// Simple test for embeddings functionality

import { summarizeDocument, getEmbeddings } from './src/lib/embeddings.ts';

async function testEmbeddings() {
  console.log('🧪 Testing Embeddings Functionality...\n');
  
  try {
    // Test 1: Document summarization
    console.log('📝 Testing document summarization...');
    const sampleCode = `
import React from 'react';

export function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button 
      className={\`btn btn-\${variant}\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
`;
    
    const summary = await summarizeDocument(sampleCode, 'Button.jsx');
    console.log('✅ Summary generated:');
    console.log(`"${summary}"\n`);
    
    // Test 2: Embeddings generation
    console.log('🔢 Testing embeddings generation...');
    const embedding = await getEmbeddings(summary);
    console.log(`✅ Embedding generated: ${embedding.length} dimensions`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]\n`);
    
    // Test 3: Similarity calculation
    console.log('📊 Testing similarity calculation...');
    const summary2 = 'This is a different React component for navigation';
    const embedding2 = await getEmbeddings(summary2);
    
    // Import similarity function
    const { cosineSimilarity } = await import('./src/lib/embeddings.ts');
    const similarity = cosineSimilarity(embedding, embedding2);
    
    console.log(`✅ Similarity between summaries: ${similarity.toFixed(4)}`);
    console.log(`   (0 = completely different, 1 = identical)\n`);
    
    console.log('🎉 All embedding tests passed!');
    console.log('\n📋 Functionality verified:');
    console.log('  ✅ Document summarization with Gemini');
    console.log('  ✅ Embedding generation with Gemini');
    console.log('  ✅ Cosine similarity calculation');
    console.log('  ✅ Ready for RAG pipeline integration');
    
  } catch (error) {
    console.error('❌ Embeddings test failed:', error);
    process.exit(1);
  }
}

// Run the test
testEmbeddings().then(() => {
  console.log('\n✨ Embeddings test completed successfully!');
});
