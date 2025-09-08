// Test GitHub Repository Loader
// This will test the core functionality directly

import { loadGitHubRepository, getRepositoryStats } from '../../src/lib/github-loader.ts';

async function testGitHubLoader() {
  console.log('🧪 Testing GitHub Repository Loader...\n');
  
  try {
    // Test with a small public repository
    const testRepo = 'https://github.com/deepakstwt/My_Portfolio_Man';
    
    console.log(`📂 Loading repository: ${testRepo}`);
    console.log('⏳ This may take a few seconds...\n');
    
    // Load repository files
    const startTime = Date.now();
    const files = await loadGitHubRepository(testRepo);
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ SUCCESS! Loaded ${files.length} files in ${loadTime}ms\n`);
    
    // Show first 5 files
    console.log('📁 First 5 files loaded:');
    files.slice(0, 5).forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.metadata?.source || 'Unknown file'}`);
      console.log(`     Size: ${file.pageContent?.length || 0} characters`);
    });
    
    // Get statistics
    console.log('\n📊 Repository Statistics:');
    const stats = getRepositoryStats(files);
    console.log(`  📄 Total files: ${stats.totalFiles}`);
    console.log(`  📝 Total lines: ${stats.totalLines.toLocaleString()}`);
    console.log(`  💾 Total size: ${Math.round(stats.totalCharacters / 1024)}KB`);
    console.log(`  📁 File types: ${Object.keys(stats.fileTypes).length}`);
    
    console.log('\n🎯 File types breakdown:');
    Object.entries(stats.fileTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([ext, count]) => {
        console.log(`    .${ext}: ${count} files`);
      });
    
    // Show a sample file content
    const readmeFile = files.find(f => f.metadata?.source?.toLowerCase().includes('readme'));
    if (readmeFile) {
      console.log('\n📖 Sample content (README file):');
      console.log('-----------------------------------');
      console.log(readmeFile.pageContent?.substring(0, 300) + '...');
    }
    
    console.log('\n🎉 TEST PASSED! GitHub Repository Loader is working correctly!');
    
  } catch (error) {
    console.error('❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Network connection problem');
    console.error('2. GitHub API rate limit exceeded');
    console.error('3. Repository not accessible');
    console.error('4. Missing dependencies');
  }
}

// Run the test
testGitHubLoader();
