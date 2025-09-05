// Simple test script to verify that the polling system is working
console.log('🧪 Testing if the polling system components exist...');

// Check if the important functions exist in the built code
const fs = require('fs');
const path = require('path');

const githubFile = path.join(__dirname, 'src', 'lib', 'github.ts');
const projectRouterFile = path.join(__dirname, 'src', 'server', 'api', 'routers', 'project.ts');

if (fs.existsSync(githubFile)) {
  const githubContent = fs.readFileSync(githubFile, 'utf8');
  
  console.log('✅ GitHub utilities file exists');
  
  // Check for key functions
  const functionsToCheck = [
    'pollCommits',
    'generateCommitSummary',
    'filterUnprocessedCommits',
    'fetchProjectGithubUrl'
  ];
  
  functionsToCheck.forEach(func => {
    if (githubContent.includes(`export async function ${func}`)) {
      console.log(`   ✅ Function ${func} found`);
    } else {
      console.log(`   ❌ Function ${func} missing`);
    }
  });
} else {
  console.log('❌ GitHub utilities file not found');
}

if (fs.existsSync(projectRouterFile)) {
  const routerContent = fs.readFileSync(projectRouterFile, 'utf8');
  
  console.log('✅ Project router file exists');
  
  // Check for key endpoints
  const endpointsToCheck = [
    'pollCommits',
    'getCommits',
    'pollAllProjectCommits'
  ];
  
  endpointsToCheck.forEach(endpoint => {
    if (routerContent.includes(`${endpoint}:`)) {
      console.log(`   ✅ Endpoint ${endpoint} found`);
    } else {
      console.log(`   ❌ Endpoint ${endpoint} missing`);
    }
  });
} else {
  console.log('❌ Project router file not found');
}

console.log('\n🎉 Basic file structure check complete!');
console.log('To test the functionality fully, use the web interface at http://localhost:3001');
