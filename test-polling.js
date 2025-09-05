#!/usr/bin/env bun
import { pollCommits, pollCommitsForProjects } from './src/lib/github.js';

/**
 * Test the commit polling functionality
 */
async function testCommitPolling() {
  try {
    console.log('🚀 Testing commit polling functionality...');
    console.log('='.repeat(60));
    
    // First, let's find a project with a GitHub URL
    const { db } = await import('./src/server/db.js');
    
    const project = await db.project.findFirst({
      where: {
        githubUrl: { not: null },
      },
      select: {
        id: true,
        name: true,
        githubUrl: true,
      },
    });
    
    if (!project) {
      console.log('❌ No project with GitHub URL found for testing');
      return;
    }
    
    console.log(`📂 Testing with project: ${project.name}`);
    console.log(`🔗 GitHub URL: ${project.githubUrl}`);
    console.log('='.repeat(60));
    
    // Test polling commits for a single project
    console.log(`\n🔍 Polling commits for project: ${project.id}`);
    const result = await pollCommits(project.id);
    
    console.log('\n📊 Polling Results:');
    console.log(`   - Total commits found: ${result.total}`);
    console.log(`   - New commits processed: ${result.processed}`);
    console.log(`   - Saved commits: ${result.commits.length}`);
    
    // Display some details about processed commits
    if (result.commits.length > 0) {
      console.log('\n📝 Processed Commits:');
      result.commits.slice(0, 3).forEach((commit, index) => {
        console.log(`\n   ${index + 1}. ${commit.commitHash.substring(0, 7)}`);
        console.log(`      Author: ${commit.commitAuthorName || 'Unknown'}`);
        console.log(`      Message: ${commit.commitMessage.split('\n')[0]}`);
        console.log(`      Summary: ${commit.summary}`);
        console.log(`      Date: ${commit.commitDate?.toISOString() || 'Unknown'}`);
      });
    }
    
    // Test polling multiple projects
    console.log('\n' + '='.repeat(60));
    console.log('🔄 Testing batch polling for all projects...');
    
    const allProjects = await db.project.findMany({
      where: {
        githubUrl: { not: null },
      },
      select: { id: true, name: true },
      take: 3, // Limit to 3 projects for testing
    });
    
    if (allProjects.length > 0) {
      const projectIds = allProjects.map(p => p.id);
      console.log(`📋 Found ${allProjects.length} projects with GitHub URLs`);
      
      const batchResult = await pollCommitsForProjects(projectIds);
      
      console.log('\n📊 Batch Polling Results:');
      console.log(`   - Total commits processed across all projects: ${batchResult.totalProcessed}`);
      
      batchResult.results.forEach((result, index) => {
        const project = allProjects.find(p => p.id === result.projectId);
        console.log(`\n   Project ${index + 1}: ${project?.name || 'Unknown'}`);
        if (result.error) {
          console.log(`      ❌ Error: ${result.error}`);
        } else {
          console.log(`      ✅ Processed: ${result.processed}/${result.total} commits`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Commit polling test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error testing commit polling:', error);
  }
}

// Run the test
console.log('🧪 Starting commit polling tests...');
testCommitPolling();
