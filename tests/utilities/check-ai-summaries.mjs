#!/usr/bin/env node
/**
 * Direct database query to check AI summaries
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAISummaries() {
  try {
    console.log('🔍 Checking AI summaries in database...');
    console.log('='.repeat(60));
    
    // Get all projects
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        githubUrl: true,
      }
    });
    
    console.log('📂 Available Projects:');
    projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name} (ID: ${project.id})`);
      console.log(`      GitHub: ${project.githubUrl}`);
    });
    
    console.log('\n' + '='.repeat(60));
    
    // Get commits with AI summaries
    const commitsWithAI = await prisma.comment.findMany({
      where: {
        summary: {
          not: {
            equals: ""
          }
        }
      },
      include: {
        project: {
          select: {
            name: true,
            githubUrl: true
          }
        }
      },
      orderBy: {
        commitDate: 'desc'
      },
      take: 10
    });
    
    console.log('🤖 Commits WITH AI Summaries:');
    if (commitsWithAI.length === 0) {
      console.log('   ❌ No commits found with AI summaries');
    } else {
      commitsWithAI.forEach((commit, index) => {
        console.log(`\\n   ${index + 1}. ${commit.commitHash.substring(0, 7)} - ${commit.project?.name}`);
        console.log(`      Message: ${commit.commitMessage.split('\\n')[0].substring(0, 80)}...`);
        console.log(`      AI Summary: ${commit.summary.substring(0, 100)}...`);
        console.log(`      Date: ${commit.commitDate?.toISOString()}`);
      });
    }
    
    // Get commits WITHOUT AI summaries
    const commitsWithoutAI = await prisma.comment.findMany({
      where: {
        OR: [
          { summary: { equals: "" } },
          { summary: null }
        ]
      },
      include: {
        project: {
          select: {
            name: true,
            githubUrl: true
          }
        }
      },
      orderBy: {
        commitDate: 'desc'
      },
      take: 5
    });
    
    console.log('\\n' + '='.repeat(60));
    console.log('❌ Commits WITHOUT AI Summaries:');
    if (commitsWithoutAI.length === 0) {
      console.log('   ✅ All commits have AI summaries!');
    } else {
      commitsWithoutAI.forEach((commit, index) => {
        console.log(`\\n   ${index + 1}. ${commit.commitHash.substring(0, 7)} - ${commit.project?.name}`);
        console.log(`      Message: ${commit.commitMessage.split('\\n')[0].substring(0, 80)}...`);
        console.log(`      Date: ${commit.commitDate?.toISOString()}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAISummaries();
