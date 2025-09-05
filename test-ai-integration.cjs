// Test script to verify Gemini AI integration with commit polling
console.log('🧪 Testing Gemini AI Integration...');

// Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/lib/ai.ts',
  'src/lib/github.ts',
  '.env'
];

console.log('\n📁 Checking required files...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Check .env for Gemini API key
console.log('\n🔑 Checking environment variables...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('GEMINI_API_KEY=')) {
    console.log('   ✅ GEMINI_API_KEY found in .env');
  } else {
    console.log('   ❌ GEMINI_API_KEY missing from .env');
  }
  
  if (envContent.includes('GITHUB_TOKEN=')) {
    console.log('   ✅ GITHUB_TOKEN found in .env');
  } else {
    console.log('   ❌ GITHUB_TOKEN missing from .env');
  }
} else {
  console.log('   ❌ .env file not found');
}

// Check src/env.js for proper schema
console.log('\n⚙️ Checking environment schema...');
const envSchemaPath = path.join(__dirname, 'src', 'env.js');
if (fs.existsSync(envSchemaPath)) {
  const envSchema = fs.readFileSync(envSchemaPath, 'utf8');
  
  if (envSchema.includes('GEMINI_API_KEY:')) {
    console.log('   ✅ GEMINI_API_KEY in environment schema');
  } else {
    console.log('   ❌ GEMINI_API_KEY missing from environment schema');
  }
} else {
  console.log('   ❌ src/env.js not found');
}

// Check AI functions in github.ts
console.log('\n🤖 Checking AI integration functions...');
const githubPath = path.join(__dirname, 'src', 'lib', 'github.ts');
if (fs.existsSync(githubPath)) {
  const githubContent = fs.readFileSync(githubPath, 'utf8');
  
  const aiFunctions = [
    'fetchCommitDiff',
    'summarizeCommit',
    'generateCommitSummary'
  ];
  
  aiFunctions.forEach(func => {
    if (githubContent.includes(`export async function ${func}`)) {
      console.log(`   ✅ Function ${func} found`);
    } else {
      console.log(`   ❌ Function ${func} missing`);
    }
  });
  
  // Check if AI import is present
  if (githubContent.includes("import('@/lib/ai')")) {
    console.log('   ✅ AI utilities import found');
  } else {
    console.log('   ❌ AI utilities import missing');
  }
} else {
  console.log('   ❌ src/lib/github.ts not found');
}

// Check AI utilities file
console.log('\n🧠 Checking AI utilities...');
const aiPath = path.join(__dirname, 'src', 'lib', 'ai.ts');
if (fs.existsSync(aiPath)) {
  const aiContent = fs.readFileSync(aiPath, 'utf8');
  
  const aiExports = [
    'getGeminiClient',
    'summarizeText',
    'testGeminiConnection'
  ];
  
  aiExports.forEach(func => {
    if (aiContent.includes(`export function ${func}`) || aiContent.includes(`export async function ${func}`)) {
      console.log(`   ✅ Function ${func} found`);
    } else {
      console.log(`   ❌ Function ${func} missing`);
    }
  });
  
  // Check Gemini import
  if (aiContent.includes('GoogleGenerativeAI')) {
    console.log('   ✅ GoogleGenerativeAI import found');
  } else {
    console.log('   ❌ GoogleGenerativeAI import missing');
  }
} else {
  console.log('   ❌ src/lib/ai.ts not found');
}

console.log('\n🎉 AI integration check complete!');
console.log('\nNext steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3001');
console.log('3. Create a project with a GitHub URL');
console.log('4. Click "Poll Commits" to test AI summarization');
console.log('5. Check the commit summaries for AI-generated content');

console.log('\n💡 Expected behavior:');
console.log('- New commits should have detailed AI summaries');
console.log('- Fallback to pattern detection if AI fails');
console.log('- Console logs should show AI processing steps');
console.log('- Summaries should be under 150 words and informative');
