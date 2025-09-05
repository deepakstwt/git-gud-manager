#!/usr/bin/env bun
import { testCommitFetcher } from './src/lib/github.js';

const testUrl = process.argv[2] || 'https://github.com/vercel/next.js';
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  process.exit(1);
}

console.log('🚀 Running GitHub commit fetcher test...');

testCommitFetcher(testUrl, githubToken);
