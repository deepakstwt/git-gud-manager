import { Octokit } from '@octokit/rest';
import axios from 'axios';

// Type definition for commit data
export interface CommitData {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string | null;
  commitAuthorAvatar: string | null;
  commitDate: Date | null;
}

/**
 * Parse GitHub URL to extract owner and repository name
 * @param githubUrl - Full GitHub repository URL
 * @returns Object with owner and repo, or null if invalid
 */
function parseGitHubUrl(githubUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(githubUrl);
    if (url.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL');
    }
    
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL format');
    }
    
    const owner = pathParts[0];
    let repo = pathParts[1];
    
    if (!owner || !repo) {
      throw new Error('Missing owner or repository name');
    }
    
    // Remove .git suffix if present
    if (repo.endsWith('.git')) {
      repo = repo.slice(0, -4);
    }
    
    return { owner, repo };
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
}

/**
 * Fetch commit history from a GitHub repository (server-side only)
 * @param githubUrl - GitHub repository URL
 * @param githubToken - GitHub personal access token
 * @returns Array of commit data objects
 */
export async function getCommitHashes(githubUrl: string, githubToken: string): Promise<CommitData[]> {
  try {
    // Initialize Octokit with provided token (server-side only)
    const octokit = new Octokit({
      auth: githubToken,
    });
    
    // Parse the GitHub URL
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error(`Invalid GitHub URL: ${githubUrl}`);
    }
    
    const { owner, repo } = parsed;
    
    console.log(`Fetching commits for ${owner}/${repo}...`);
    
    // Fetch commits from GitHub API
    const response = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 15, // Latest 15 commits
    });
    
    // Map GitHub API response to our CommitData format
    const commits: CommitData[] = response.data.map((commit) => ({
      commitHash: commit.sha,
      commitMessage: commit.commit.message,
      commitAuthorName: commit.commit.author?.name ?? null,
      commitAuthorAvatar: commit.author?.avatar_url ?? null,
      commitDate: commit.commit.author?.date ? new Date(commit.commit.author.date) : null,
    }));
    
    // Sort by commit date (descending - newest first)
    commits.sort((a, b) => {
      if (!a.commitDate) return 1;
      if (!b.commitDate) return -1;
      return b.commitDate.getTime() - a.commitDate.getTime();
    });
    
    console.log(`Successfully fetched ${commits.length} commits`);
    console.log('Sample commit data:', commits[0]);
    
    return commits;
    
  } catch (error) {
    console.error('Error fetching commits:', error);
    throw error;
  }
}

/**
 * Test function to verify the commit fetcher works
 * @param githubUrl - GitHub repository URL to test
 * @param githubToken - GitHub personal access token
 */
export async function testCommitFetcher(githubUrl: string, githubToken: string): Promise<void> {
  try {
    console.log(`\n🔍 Testing commit fetcher with: ${githubUrl}`);
    console.log('='.repeat(50));
    
    const commits = await getCommitHashes(githubUrl, githubToken);
    
    console.log(`\n✅ Success! Found ${commits.length} commits:`);
    console.log('='.repeat(50));
    
    commits.forEach((commit, index) => {
      console.log(`\n${index + 1}. ${commit.commitHash.substring(0, 7)}`);
      console.log(`   Author: ${commit.commitAuthorName || 'Unknown'}`);
      console.log(`   Date: ${commit.commitDate?.toISOString() || 'Unknown'}`);
      console.log(`   Message: ${commit.commitMessage.split('\n')[0]}`);
      console.log(`   Avatar: ${commit.commitAuthorAvatar || 'None'}`);
    });
    
  } catch (error) {
    console.error('\n❌ Error testing commit fetcher:', error);
  }
}

/**
 * Helper function to fetch project and its GitHub URL from database
 * @param projectId - The project ID to fetch
 * @returns Object with project and githubUrl
 */
export async function fetchProjectGithubUrl(projectId: string): Promise<{ project: any; githubUrl: string }> {
  const { db } = await import('@/server/db');
  
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        githubUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    if (!project.githubUrl) {
      throw new Error(`Project ${project.name} does not have a GitHub URL configured`);
    }

    return { project, githubUrl: project.githubUrl };
  } catch (error) {
    console.error('Error fetching project GitHub URL:', error);
    throw error;
  }
}

/**
 * Helper function to filter commits that haven't been processed yet
 * @param commits - Array of commit data from GitHub
 * @param projectId - The project ID to check against
 * @returns Array of commits that are not yet in the database
 */
export async function filterUnprocessedCommits(commits: CommitData[], projectId: string): Promise<CommitData[]> {
  const { db } = await import('@/server/db');
  
  try {
    // Get all existing commit hashes for this project
    const existingCommits = await db.comment.findMany({
      where: { projectId },
      select: { commitHash: true },
    });

    const existingHashes = new Set(existingCommits.map(commit => commit.commitHash));
    
    // Filter out commits that already exist
    const newCommits = commits.filter(commit => !existingHashes.has(commit.commitHash));
    
    console.log(`Found ${newCommits.length} new commits out of ${commits.length} total commits`);
    return newCommits;
  } catch (error) {
    console.error('Error filtering unprocessed commits:', error);
    throw error;
  }
}

/**
 * Fetch commit diff from GitHub
 * @param githubUrl - GitHub repository URL
 * @param commitHash - The commit hash to fetch diff for
 * @param githubToken - GitHub personal access token
 * @returns Promise<string> - The commit diff text
 */
export async function fetchCommitDiff(githubUrl: string, commitHash: string, githubToken: string): Promise<string> {
  try {
    // Parse the GitHub URL to get owner and repo
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error(`Invalid GitHub URL: ${githubUrl}`);
    }
    
    const { owner, repo } = parsed;
    
    // Initialize Octokit
    const octokit = new Octokit({
      auth: githubToken,
    });
    
    console.log(`Fetching commit diff for ${owner}/${repo}@${commitHash.substring(0, 7)}...`);
    
    // Fetch the commit details with diff
    const response = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commitHash,
    });
    
    // Extract the commit message and files changed
    const commit = response.data;
    const commitInfo = {
      message: commit.commit.message,
      author: commit.commit.author?.name || 'Unknown',
      date: commit.commit.author?.date || new Date().toISOString(),
      filesChanged: commit.files?.length || 0,
      additions: commit.stats?.additions || 0,
      deletions: commit.stats?.deletions || 0,
      files: commit.files?.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch?.substring(0, 1000) || '' // Limit patch size
      })) || []
    };
    
    // Create a structured diff text for AI analysis
    const diffText = `
COMMIT: ${commitHash.substring(0, 7)}
MESSAGE: ${commitInfo.message}
AUTHOR: ${commitInfo.author}
DATE: ${commitInfo.date}
STATS: +${commitInfo.additions} -${commitInfo.deletions} (${commitInfo.filesChanged} files)

FILES CHANGED:
${commitInfo.files.map(file => 
  `- ${file.filename} (${file.status}) +${file.additions} -${file.deletions}`
).join('\n')}

SAMPLE CHANGES:
${commitInfo.files.slice(0, 3).map(file => 
  file.patch ? `\n--- ${file.filename} ---\n${file.patch}` : ''
).join('\n')}
    `.trim();
    
    console.log(`Successfully fetched diff for commit ${commitHash.substring(0, 7)} (${diffText.length} chars)`);
    return diffText;
    
  } catch (error) {
    console.error(`Error fetching commit diff for ${commitHash}:`, error);
    // Return a basic summary if we can't fetch the full diff
    throw error;
  }
}

/**
 * Get raw commit diff from GitHub API using Axios
 * @param githubUrl - GitHub repository URL  
 * @param commitHash - The commit hash to fetch diff for
 * @param githubToken - GitHub personal access token
 * @returns Promise<string> - The raw diff as a string
 */
export async function getCommitDiff(githubUrl: string, commitHash: string, githubToken: string): Promise<string> {
  try {
    // Parse the GitHub URL to get owner and repo
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error(`Invalid GitHub URL: ${githubUrl}`);
    }
    
    const { owner, repo } = parsed;
    
    console.log(`Fetching raw diff for ${owner}/${repo}@${commitHash.substring(0, 7)}...`);
    
    // Use Axios to GET the diff with proper headers
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitHash}.diff`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3.diff',
          'Authorization': `token ${githubToken}`,
          'User-Agent': 'vrindahelp-commit-analyzer'
        }
      }
    );
    
    console.log(`Successfully fetched raw diff for commit ${commitHash.substring(0, 7)} (${response.data.length} chars)`);
    return response.data;
    
  } catch (error) {
    console.error(`Error fetching raw commit diff for ${commitHash}:`, error);
    throw error;
  }
}

/**
 * Summarize a commit using AI analysis of its diff
 * @param githubUrl - GitHub repository URL
 * @param commitHash - The commit hash to summarize
 * @param commitMessage - The commit message
 * @param githubToken - GitHub personal access token
 * @returns Promise<string> - AI-generated summary
 */
export async function summarizeCommit(githubUrl: string, commitHash: string, commitMessage: string, githubToken: string): Promise<string> {
  try {
    console.log(`🤖 Generating AI summary for commit ${commitHash.substring(0, 7)}...`);
    
    // Import AI utilities
    const { summarizeText } = await import('@/lib/ai');
    
    // Fetch the commit diff
    const diffText = await fetchCommitDiff(githubUrl, commitHash, githubToken);
    
    // Generate AI summary using Gemini
    const aiSummary = await summarizeText(diffText);
    
    console.log(`✅ AI summary generated for ${commitHash.substring(0, 7)}: ${aiSummary.substring(0, 100)}...`);
    return aiSummary;
    
  } catch (error) {
    console.error(`❌ Failed to generate AI summary for commit ${commitHash}:`, error);
    
    // Fallback to pattern-based summary
    return generateBasicCommitSummary(commitMessage);
  }
}

/**
 * Generate basic pattern-based summary when AI fails
 * @param commitMessage - The commit message to analyze
 * @returns string - Basic summary
 */
function generateBasicCommitSummary(commitMessage: string): string {
  const message = commitMessage.toLowerCase();
  
  let summary = "📝 Code changes detected. ";
  
  // Simple pattern matching for fallback
  if (message.includes('fix') || message.includes('bug')) {
    summary += "🐛 This appears to be a bug fix or error correction.";
  } else if (message.includes('feat') || message.includes('add') || message.includes('new')) {
    summary += "✨ New feature or functionality has been added.";
  } else if (message.includes('update') || message.includes('modify') || message.includes('change')) {
    summary += "🔄 Existing code has been updated or modified.";
  } else if (message.includes('remove') || message.includes('delete')) {
    summary += "🗑️ Code or features have been removed.";
  } else if (message.includes('refactor')) {
    summary += "♻️ Code has been refactored for better structure.";
  } else if (message.includes('doc') || message.includes('readme')) {
    summary += "📚 Documentation has been updated.";
  } else if (message.includes('test')) {
    summary += "🧪 Tests have been added or updated.";
  } else if (message.includes('merge')) {
    summary += "🔀 Branch merge containing multiple changes.";
  } else {
    summary += "⚡ General improvements and updates.";
  }
  
  return summary + " (AI analysis failed - using pattern detection)";
}

/**
 * Enhanced generate commit summary function with AI integration
 * @param commit - The commit data to summarize
 * @param projectId - The project ID for context
 * @param githubUrl - GitHub repository URL for fetching diffs
 * @returns Promise<string> - AI-generated summary
 */
export async function generateCommitSummary(commit: CommitData, projectId: string, githubUrl?: string): Promise<string> {
  try {
    // If we have a GitHub URL, use AI-powered analysis
    if (githubUrl) {
      const { env } = await import('@/env');
      const aiSummary = await summarizeCommit(githubUrl, commit.commitHash, commit.commitMessage, env.GITHUB_TOKEN);
      return aiSummary;
    }
    
    // Fallback to pattern-based analysis
    return generateBasicCommitSummary(commit.commitMessage);
    
  } catch (error) {
    console.error('Error generating commit summary:', error);
    return generateBasicCommitSummary(commit.commitMessage);
  }
}

/**
 * Poll commits for a specific project and process new ones
 * @param projectId - The project ID to poll commits for
 * @returns Promise<{ processed: number; total: number; commits: any[] }>
 */
export async function pollCommits(projectId: string): Promise<{ processed: number; total: number; commits: any[] }> {
  const { env } = await import('@/env');
  const { db } = await import('@/server/db');
  
  try {
    console.log(`🔍 Polling commits for project: ${projectId}`);
    
    // Step 1: Fetch project and GitHub URL from DB
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    console.log(`📂 Project found: ${project.name} -> ${githubUrl}`);
    
    // Step 2: Use getCommitHashes to fetch the latest commits
    const allCommits = await getCommitHashes(githubUrl, env.GITHUB_TOKEN);
    const latestCommits = allCommits.slice(0, 10); // Limit to 10 latest
    
    console.log(`📥 Fetched ${latestCommits.length} latest commits from GitHub`);
    
    // Step 3: Filter out already-processed commits
    const newCommits = await filterUnprocessedCommits(latestCommits, projectId);
    
    if (newCommits.length === 0) {
      console.log(`✅ No new commits to process for project ${project.name}`);
      return { processed: 0, total: latestCommits.length, commits: [] };
    }
    
    console.log(`🆕 Processing ${newCommits.length} new commits with AI summarization...`);
    
    // Process commits concurrently with Promise.allSettled
    const commitProcessingPromises = newCommits.map(async (commit) => {
      try {
        // Use the local summarizeCommit function which handles everything
        const summary = await summarizeCommit(githubUrl, commit.commitHash, commit.commitMessage, env.GITHUB_TOKEN);
        
        return {
          ...commit,
          summary,
          success: true
        };
      } catch (error) {
        console.error(`Failed to process commit ${commit.commitHash.substring(0, 7)}:`, error);
        return {
          ...commit,
          summary: generateBasicCommitSummary(commit.commitMessage), // Use fallback summary
          success: false
        };
      }
    });
    
    // Use Promise.allSettled to process all diffs concurrently
    const results = await Promise.allSettled(commitProcessingPromises);
    
    // Collect summaries, defaulting to "" if a summary fails
    const processedCommits = results.map((result, index) => {
      const commit = newCommits[index];
      if (!commit) {
        throw new Error(`Commit at index ${index} is undefined`);
      }
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Promise rejected for commit ${commit.commitHash.substring(0, 7)}:`, result.reason);
        return {
          ...commit,
          summary: "",
          success: false
        };
      }
    });
    
    // Step 5: Save results to DB with db.comment.createMany
    // Ensure type safety with non-null assertions where data is guaranteed
    const commitsToSave = processedCommits.map(commit => ({
      projectId,
      commitHash: commit.commitHash!, // Non-null assertion - data is guaranteed from GitHub API
      commitMessage: commit.commitMessage!, // Non-null assertion - data is guaranteed from GitHub API
      commitAuthorName: commit.commitAuthorName,
      commitAuthorAvatar: commit.commitAuthorAvatar,
      commitDate: commit.commitDate!,
      summary: commit.summary,
    }));
    
    // Save all commits to database in one batch operation
    const savedCommits = await db.comment.createMany({
      data: commitsToSave,
    });
    
    const successfulSummaries = processedCommits.filter(c => c.success).length;
    
    console.log(`🎉 Successfully processed ${processedCommits.length} commits with ${successfulSummaries} AI summaries`);
    console.log(`💾 Saved ${savedCommits.count} commits to database`);
    
    return {
      processed: savedCommits.count,
      total: latestCommits.length,
      commits: commitsToSave,
    };
    
  } catch (error) {
    console.error(`❌ Error polling commits for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Poll commits for multiple projects
 * @param projectIds - Array of project IDs to poll
 * @returns Promise<{ results: any[]; totalProcessed: number }>
 */
export async function pollCommitsForProjects(projectIds: string[]): Promise<{ results: any[]; totalProcessed: number }> {
  try {
    console.log(`🔄 Polling commits for ${projectIds.length} projects...`);
    
    const results = [];
    let totalProcessed = 0;
    
    for (const projectId of projectIds) {
      try {
        const result = await pollCommits(projectId);
        results.push({ projectId, ...result });
        totalProcessed += result.processed;
      } catch (error) {
        console.error(`Failed to poll commits for project ${projectId}:`, error);
        results.push({ 
          projectId, 
          error: error instanceof Error ? error.message : 'Unknown error', 
          processed: 0, 
          total: 0, 
          commits: [] 
        });
      }
    }
    
    console.log(`🏁 Completed polling. Total commits processed: ${totalProcessed}`);
    
    return { results, totalProcessed };
  } catch (error) {
    console.error('Error polling commits for multiple projects:', error);
    throw error;
  }
}

// Export default for direct script execution
export default { getCommitHashes, testCommitFetcher };
