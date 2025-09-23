# GitHub Repository Loader with LangChain

This utility provides a way to load GitHub repository files and their contents using LangChain's `GithubRepoLoader`.

## Installation

The required dependencies have been installed:
```bash
npm install @langchain/community langchain --legacy-peer-deps
```

## Usage

### Basic Usage

```typescript
import { loadGitHubRepository } from '@/lib/github-loader';

// Load all files from a repository
const files = await loadGitHubRepository(
  "https://github.com/owner/repo", 
  process.env.GITHUB_TOKEN // optional
);

console.log(`Loaded ${files.length} files`);
files.forEach(file => {
  console.log(`File: ${file.metadata?.source}`);
  console.log(`Content: ${file.pageContent?.substring(0, 100)}...`);
});
```

### Load Specific File Types

```typescript
import { loadGitHubRepositoryByExtensions } from '@/lib/github-loader';

// Load only code files
const codeFiles = await loadGitHubRepositoryByExtensions(
  "https://github.com/owner/repo",
  process.env.GITHUB_TOKEN,
  ['.ts', '.tsx', '.js', '.jsx', '.py', '.md']
);
```

### Get Repository Statistics

```typescript
import { getRepositoryStats } from '@/lib/github-loader';

const files = await loadGitHubRepository("https://github.com/owner/repo");
const stats = getRepositoryStats(files);

console.log('Repository Stats:', {
  totalFiles: stats.totalFiles,
  totalLines: stats.totalLines,
  totalCharacters: stats.totalCharacters,
  largestFile: stats.largestFile,
  fileTypes: stats.fileTypes
});
```

## TRPC Integration

A TRPC procedure has been added to the project router:

```typescript
// In your component
const { data: repositoryData } = api.project.loadRepositoryFiles.useQuery({
  projectId: "your-project-id",
  extensions: ['.ts', '.tsx', '.js', '.jsx']
});
```

## UI Component

A `RepositoryLoader` component has been created and added to the dashboard that provides:

- Repository loading button
- Statistics display (total files, lines, size, file types)
- File type badges
- Sample files list

## API Testing

Test the implementation via the API endpoint:
```
GET /api/test-github-loader
```

## Features

✅ **Load all repository files** with content and metadata  
✅ **Filter by file extensions** to focus on specific file types  
✅ **Repository statistics** including file counts, lines, and sizes  
✅ **TRPC integration** for easy use in React components  
✅ **UI component** for dashboard integration  
✅ **Error handling** with detailed error messages  
✅ **GitHub token support** for private repos and higher rate limits  

## Configuration Options

The `GithubRepoLoader` is configured with:

- **branch**: "main" (default branch to load from)
- **ignoreFiles**: ["package-lock.json", "pnpm-lock.yaml", "bun.lockb"] (files to skip)
- **recursive**: true (load files from all subdirectories)
- **unknown**: "warn" (how to handle unknown file types)

## Document Structure

Each loaded document contains:

```typescript
{
  pageContent: string;     // File content
  metadata: {
    source: string;        // File path
    // ... other metadata
  }
}
```

## Error Handling

The functions include comprehensive error handling:

- Network errors when accessing GitHub
- Invalid repository URLs
- Authentication issues with private repositories
- Rate limit exceeded errors

All errors are properly caught and re-thrown with descriptive messages.
