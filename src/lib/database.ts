import { db } from '@/server/db';
import { getCommitHashes, type CommitData } from '@/lib/github';

/**
 * Save commits to the database for a specific project
 * @param projectId - The project ID to associate commits with
 * @param githubUrl - The GitHub repository URL
 * @param githubToken - GitHub personal access token
 * @returns Array of saved commit records
 */
export async function saveCommitsToDatabase(projectId: string, githubUrl: string, githubToken: string) {
  try {
    console.log(`Fetching and saving commits for project ${projectId}...`);
    
    // Fetch commits from GitHub
    const commits = await getCommitHashes(githubUrl, githubToken);
    
    // Save commits to database using upsert to handle duplicates
    const savedCommits = [];
    
    for (const commit of commits) {
      const savedCommit = await db.comment.upsert({
        where: {
          projectId_commitHash: {
            projectId,
            commitHash: commit.commitHash,
          },
        },
        update: {
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
        },
        create: {
          projectId,
          commitHash: commit.commitHash,
          commitMessage: commit.commitMessage,
          commitAuthorName: commit.commitAuthorName,
          commitAuthorAvatar: commit.commitAuthorAvatar,
          commitDate: commit.commitDate,
        },
      });
      
      savedCommits.push(savedCommit);
    }
    
    console.log(`Successfully saved ${savedCommits.length} commits to database`);
    return savedCommits;
    
  } catch (error) {
    console.error('Error saving commits to database:', error);
    throw error;
  }
}

/**
 * Get commits from database for a specific project
 * @param projectId - The project ID
 * @returns Array of commit records from database
 */
export async function getCommitsFromDatabase(projectId: string) {
  return await db.comment.findMany({
    where: { projectId },
    orderBy: { commitDate: 'desc' },
    take: 15, // Limit to latest 15 commits
  });
}

/**
 * Sync commits for a project (fetch from GitHub and save to database)
 * @param projectId - The project ID
 * @param githubUrl - The GitHub repository URL
 * @param githubToken - GitHub personal access token
 */
export async function syncProjectCommits(projectId: string, githubUrl: string, githubToken: string) {
  try {
    const savedCommits = await saveCommitsToDatabase(projectId, githubUrl, githubToken);
    console.log(`Synced ${savedCommits.length} commits for project ${projectId}`);
    return savedCommits;
  } catch (error) {
    console.error(`Failed to sync commits for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Test function to demonstrate the database functionality
 */
export async function testDatabaseIntegration() {
  try {
    console.log('🔍 Testing database integration...');
    
    // Find a project with a GitHub URL
    const project = await db.project.findFirst({
      where: {
        githubUrl: { not: null },
      },
    });
    
    if (!project || !project.githubUrl) {
      console.log('No project with GitHub URL found. Creating a test project...');
      return;
    }
    
    console.log(`Found project: ${project.name} (${project.githubUrl})`);
    
    // For testing, we'll need to pass the GitHub token
    // In production, this would come from the environment
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.log('GitHub token not found in environment');
      return;
    }
    
    // Sync commits for this project
    const commits = await syncProjectCommits(project.id, project.githubUrl, githubToken);
    console.log(`✅ Successfully synced ${commits.length} commits`);
    
    // Retrieve commits from database
    const dbCommits = await getCommitsFromDatabase(project.id);
    console.log(`✅ Retrieved ${dbCommits.length} commits from database`);
    
    // Display first few commits
    dbCommits.slice(0, 3).forEach((commit, index) => {
      console.log(`\n${index + 1}. ${commit.commitHash.substring(0, 7)}`);
      console.log(`   Author: ${commit.commitAuthorName || 'Unknown'}`);
      console.log(`   Date: ${commit.commitDate?.toISOString() || 'Unknown'}`);
      console.log(`   Message: ${commit.commitMessage.split('\n')[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Database integration test failed:', error);
  }
}

export default {
  saveCommitsToDatabase,
  getCommitsFromDatabase,
  syncProjectCommits,
  testDatabaseIntegration,
};
