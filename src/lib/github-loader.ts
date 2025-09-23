import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

/**
 * Load GitHub repository files and contents using LangChain's GithubRepoLoader
 * @param githubUrl - The GitHub repository URL (e.g., "https://github.com/owner/repo")
 * @param githubToken - Optional GitHub access token for private repos or higher rate limits
 * @returns Promise<Document[]> - Array of documents containing file paths, contents, and metadata
 */
export async function loadGitHubRepository(
  githubUrl: string,
  githubToken?: string
) {
  try {
    // Extract owner and repo from URL with error handling
    const urlParts = githubUrl.split('/');
    if (urlParts.length < 2) {
      throw new Error(`Invalid GitHub URL: ${githubUrl}`);
    }
    const [owner, repo] = urlParts.slice(-2);

    // Fetch repository info with caching and optimized headers
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await fetch(apiUrl, {
      headers: {
        ...(githubToken ? { Authorization: `token ${githubToken}` } : {}),
        'Accept': 'application/vnd.github.v3+json',
        'If-None-Match': '', // Force fresh response
      },
      cache: 'no-store', // Don't cache API responses
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText} (${response.status})`);
    }

    const repoInfo = await response.json();
    
    // Create GithubRepoLoader instance with optimized settings
    const loader = new GithubRepoLoader(githubUrl, {
      accessToken: githubToken || undefined,
      branch: repoInfo.default_branch || "main",
      ignoreFiles: [
        "package-lock.json",
        "pnpm-lock.yaml",
        "bun.lockb",
        "node_modules/**/*",
        ".git/**/*",
        "dist/**/*",
        "build/**/*", 
        ".next/**/*",
        "*.log",
        "*.lock",
        "*.map",
        "**/*.min.js",
        "**/*.min.css",
        "**/coverage/**",
        "**/test/**",
        "**/__tests__/**"
      ],
      recursive: true,
      unknown: "warn",
      maxConcurrency: 10, // Increased concurrency for faster loading
    });

    // Load all files and their contents
    const documents = await loader.load();

    console.log(`✅ Loaded ${documents.length} files from repository: ${githubUrl}`);
    
    return documents;
  } catch (error) {
    console.error(`❌ Failed to load GitHub repository ${githubUrl}:`, error);
    throw new Error(`Failed to load GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load GitHub repository and filter files by extension
 * @param githubUrl - The GitHub repository URL
 * @param githubToken - Optional GitHub access token
 * @param extensions - Array of file extensions to include (e.g., ['.ts', '.tsx', '.js'])
 * @returns Promise<Document[]> - Filtered array of documents
 */
export async function loadGitHubRepositoryByExtensions(
  githubUrl: string,
  githubToken?: string,
  extensions: string[] = ['.ts', '.tsx', '.js', '.jsx', '.py', '.md']
) {
  const documents = await loadGitHubRepository(githubUrl, githubToken);
  
  // Filter documents by file extensions
  const filtered = documents.filter(doc => {
    const source = doc.metadata?.source || '';
    return extensions.some(ext => source.endsWith(ext));
  });

  console.log(`🔍 Filtered to ${filtered.length} files with extensions: ${extensions.join(', ')}`);
  
  return filtered;
}

/**
 * Get repository statistics from loaded documents
 * @param documents - Array of documents from loadGitHubRepository
 * @returns Object with repository statistics
 */
export function getRepositoryStats(documents: any[]) {
  const stats = {
    totalFiles: documents.length,
    totalLines: 0,
    totalCharacters: 0,
    fileTypes: {} as Record<string, number>,
    largestFile: { path: '', size: 0 },
  };

  documents.forEach(doc => {
    const content = doc.pageContent || '';
    const source = doc.metadata?.source || '';
    
    // Count lines and characters
    const lines = content.split('\n').length;
    const characters = content.length;
    
    stats.totalLines += lines;
    stats.totalCharacters += characters;
    
    // Track file types
    const extension = source.split('.').pop() || 'unknown';
    stats.fileTypes[extension] = (stats.fileTypes[extension] || 0) + 1;
    
    // Track largest file
    if (characters > stats.largestFile.size) {
      stats.largestFile = { path: source, size: characters };
    }
  });

  return stats;
}
