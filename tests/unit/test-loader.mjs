import { loadGitHubRepository, loadGitHubRepositoryByExtensions } from '../../src/lib/github-loader.ts';

async function testLoader() {
    try {
        console.log('🔍 Starting repository loader test...');
        
        // Test with the current repository
        const repoUrl = 'https://github.com/deepakstwt/git-gud-manager';
        console.log(`\n📂 Testing with repository: ${repoUrl}`);
        
        // First test: Load all files
        console.log('\n1️⃣ Testing basic repository loading...');
        const allFiles = await loadGitHubRepository(repoUrl, process.env.GITHUB_TOKEN);
        console.log(`✅ Successfully loaded ${allFiles.length} files from repository`);
        
        // Second test: Load specific file types
        console.log('\n2️⃣ Testing file type filtering...');
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
        const filteredFiles = await loadGitHubRepositoryByExtensions(
            repoUrl,
            process.env.GITHUB_TOKEN,
            extensions
        );
        console.log(`✅ Successfully loaded ${filteredFiles.length} ${extensions.join(', ')} files`);
        
        // Print some sample files
        console.log('\n📄 Sample files loaded:');
        filteredFiles.slice(0, 5).forEach(file => {
            console.log(`- ${file.metadata?.source || 'unknown'}`);
        });
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testLoader();