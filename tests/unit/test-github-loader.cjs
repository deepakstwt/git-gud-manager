const { config } = require('dotenv');

// Load environment variables
config();

async function testGitHubLoader() {
  try {
    console.log('🧪 Testing GitHub Repository Loader...\n');

    // Import the module dynamically since it's TypeScript
    const { loadGitHubRepository, loadGitHubRepositoryByExtensions, getRepositoryStats } = 
      await import('../../src/lib/github-loader.ts');

    // Test with a public repository
    const testRepo = 'https://github.com/deepakstwt/My_Portfolio_Man';
    const githubToken = process.env.GITHUB_TOKEN;

    console.log(`📂 Loading repository: ${testRepo}`);
    console.log(`🔑 Using GitHub token: ${githubToken ? 'Yes' : 'No'}\n`);

    // Test 1: Load all files
    console.log('📋 Test 1: Loading all files...');
    const allFiles = await loadGitHubRepository(testRepo, githubToken);
    
    console.log(`✅ Loaded ${allFiles.length} files`);
    console.log('\n📊 Sample files:');
    allFiles.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.metadata?.source || 'Unknown'}`);
      console.log(`     Size: ${file.pageContent?.length || 0} characters`);
    });

    // Test 2: Load only specific file types
    console.log('\n📋 Test 2: Loading only code files...');
    const codeFiles = await loadGitHubRepositoryByExtensions(
      testRepo, 
      githubToken, 
      ['.js', '.jsx', '.ts', '.tsx', '.py', '.md', '.json']
    );
    
    console.log(`✅ Found ${codeFiles.length} code files`);
    
    // Test 3: Get repository statistics
    console.log('\n📋 Test 3: Repository statistics...');
    const stats = getRepositoryStats(allFiles);
    
    console.log('📊 Repository Stats:');
    console.log(`  Total files: ${stats.totalFiles}`);
    console.log(`  Total lines: ${stats.totalLines.toLocaleString()}`);
    console.log(`  Total characters: ${stats.totalCharacters.toLocaleString()}`);
    console.log(`  Largest file: ${stats.largestFile.path} (${stats.largestFile.size.toLocaleString()} chars)`);
    console.log('  File types:');
    Object.entries(stats.fileTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([ext, count]) => {
        console.log(`    .${ext}: ${count} files`);
      });

    // Test 4: Show sample file content
    console.log('\n📋 Test 4: Sample file content...');
    const sampleFile = allFiles.find(f => f.metadata?.source?.endsWith('README.md')) || allFiles[0];
    if (sampleFile) {
      console.log(`📄 File: ${sampleFile.metadata?.source}`);
      console.log(`📝 Content preview (first 200 chars):`);
      console.log(sampleFile.pageContent?.substring(0, 200) + '...\n');
      
      console.log(`🏷️ Metadata:`);
      console.log(JSON.stringify(sampleFile.metadata, null, 2));
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGitHubLoader();
