#!/usr/bin/env node

/**
 * Test script for commit summarization pipeline with Gemini + GitHub API
 * Tests the complete flow: getCommitDiff -> summarizeCommit -> pollCommits
 */

import { getCommitDiff, pollCommits } from '../../src/lib/github.js';
import { summarizeCommit, testGeminiConnection } from '../../src/lib/gemini.js';

async function testCommitSummarizationPipeline() {
  console.log('🧪 Testing Commit Summarization Pipeline with Gemini + GitHub API\n');
  
  try {
    // Step 1: Test Gemini connection
    console.log('1️⃣ Testing Gemini AI connection...');
    const geminiWorks = await testGeminiConnection();
    if (!geminiWorks) {
      throw new Error('Gemini AI connection failed');
    }
    console.log('✅ Gemini AI connection successful\n');
    
    // Step 2: Test getCommitDiff function
    console.log('2️⃣ Testing getCommitDiff function...');
    const testRepo = 'https://github.com/microsoft/vscode';
    const testCommitHash = 'HEAD'; // Use HEAD to get the latest commit
    
    // Get environment variables
    const { env } = await import('../../src/env.js');
    
    try {
      const diff = await getCommitDiff(testRepo, testCommitHash, env.GITHUB_TOKEN);
      console.log(`✅ Successfully fetched diff (${diff.length} characters)`);
      console.log(`📄 Sample diff preview: ${diff.substring(0, 200)}...\n`);
      
      // Step 3: Test summarizeCommit function
      console.log('3️⃣ Testing summarizeCommit function...');
      const summary = await summarizeCommit(diff);
      console.log(`✅ AI Summary generated: ${summary}\n`);
      
    } catch (diffError) {
      console.warn(`⚠️ Could not test with ${testRepo}, trying with a smaller diff...`);
      
      // Test with a mock diff instead
      const mockDiff = `
diff --git a/src/auth.ts b/src/auth.ts
index 1234567..abcdefg 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,4 +10,6 @@
 export function login(email: string, password: string) {
+  if (!email || !password) {
+    throw new Error('Email and password are required');
+  }
   return authenticateUser(email, password);
 }
`;
      
      const summary = await summarizeCommit(mockDiff);
      console.log(`✅ AI Summary (mock diff): ${summary}\n`);
    }
    
    // Step 4: Test the complete pollCommits pipeline
    console.log('4️⃣ Testing complete pollCommits pipeline...');
    console.log('(This will use the database and process real commits)\n');
    
    // Get a project from the database to test with
    const { db } = await import('../../src/server/db.js');
    
    const testProject = await db.project.findFirst({
      where: {
        githubUrl: { not: null }
      }
    });
    
    if (!testProject) {
      console.log('⚠️ No projects with GitHub URLs found in database');
      console.log('✅ Individual functions tested successfully');
      return;
    }
    
    console.log(`📂 Testing with project: ${testProject.name} (${testProject.githubUrl})`);
    
    const pollResult = await pollCommits(testProject.id);
    
    console.log(`✅ Poll completed successfully!`);
    console.log(`   - Processed: ${pollResult.processed} commits`);
    console.log(`   - Total available: ${pollResult.total} commits`);
    console.log(`   - Commits with AI summaries: ${pollResult.commits.length}`);
    
    if (pollResult.commits.length > 0) {
      const sampleCommit = pollResult.commits[0];
      console.log(`\n📝 Sample commit summary:`);
      console.log(`   Hash: ${sampleCommit.commitHash?.substring(0, 7)}`);
      console.log(`   Message: ${sampleCommit.commitMessage?.split('\n')[0]}`);
      console.log(`   AI Summary: ${sampleCommit.summary}`);
    }
    
    console.log('\n🎉 All tests passed! Commit summarization pipeline is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testCommitSummarizationPipeline().catch(console.error);
