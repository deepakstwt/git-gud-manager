import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

async function testGitHubAPI() {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error('❌ No GitHub token found in environment variables');
        process.exit(1);
    }

    console.log('🔑 GitHub token found');
    
    const repo = 'deepakstwt/git-gud-manager';
    const url = `https://api.github.com/repos/${repo}`;
    
    try {
        console.log(`📡 Testing API access to ${repo}...`);
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API responded with ${response.status}: ${await response.text()}`);
        }
        
        const data = await response.json();
        console.log('✅ Successfully accessed repository:');
        console.log(`- Name: ${data.name}`);
        console.log(`- Description: ${data.description}`);
        console.log(`- Default Branch: ${data.default_branch}`);
        console.log(`- Stars: ${data.stargazers_count}`);
    } catch (error) {
        console.error('❌ Error testing GitHub API:', error);
        process.exit(1);
    }
}

testGitHubAPI();