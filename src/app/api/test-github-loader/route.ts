import { NextResponse } from 'next/server';
import { loadGitHubRepository, getRepositoryStats } from '@/lib/github-loader';
import { env } from '@/env';

export async function GET() {
  try {
    console.log('🧪 Testing GitHub Repository Loader API...');

    // Test with the manish project repository
    const testRepo = 'https://github.com/deepakstwt/My_Portfolio_Man';
    const githubToken = env.GITHUB_TOKEN;

    console.log(`📂 Loading repository: ${testRepo}`);

    // Load all files from the repository
    const allFiles = await loadGitHubRepository(testRepo, githubToken);
    
    // Get repository statistics
    const stats = getRepositoryStats(allFiles);
    
    // Prepare sample files for response
    const sampleFiles = allFiles.slice(0, 5).map(file => ({
      path: file.metadata?.source || 'Unknown',
      size: file.pageContent?.length || 0,
      contentPreview: file.pageContent?.substring(0, 100) + '...'
    }));

    return NextResponse.json({
      success: true,
      repository: testRepo,
      totalFiles: allFiles.length,
      stats: {
        totalFiles: stats.totalFiles,
        totalLines: stats.totalLines,
        totalCharacters: stats.totalCharacters,
        largestFile: stats.largestFile,
        fileTypes: Object.entries(stats.fileTypes)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .reduce((acc, [ext, count]) => ({ ...acc, [ext]: count }), {})
      },
      sampleFiles,
      message: `Successfully loaded ${allFiles.length} files from repository`
    });

  } catch (error: any) {
    console.error('❌ GitHub loader test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
}
