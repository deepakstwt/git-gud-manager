#!/usr/bin/env node
/**
 * Simple database connection test using Prisma directly
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🚀 Testing database connection...');
    
    console.log('📊 Getting database stats...');
    
    // Get basic counts
    const userCount = await db.user.count();
    const projectCount = await db.project.count();
    const commitCount = await db.comment.count();
    
    console.log(`👤 Users: ${userCount}`);
    console.log(`📁 Projects: ${projectCount}`);
    console.log(`💬 Commits: ${commitCount}`);
    
    console.log('✅ Database connection test PASSED');
    
  } catch (error) {
    console.error('❌ Database connection test FAILED:', error.message);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

testDatabaseConnection();
