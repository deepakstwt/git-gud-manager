#!/usr/bin/env node
/**
 * Check the specific commits for the manish project
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkManishProject() {
  try {
    console.log('🔍 Checking manish project specifically...');
    console.log('='.repeat(60));
    
    const projectId = 'cmf9n3gux0002ph3c73jiq93t';
    
    // Get the project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        githubUrl: true,
      }
    });
    
    if (!project) {
      console.log('❌ Project not found!');
      return;
    }
    
    console.log('📂 Project Details:');
    console.log(`   Name: ${project.name}`);
    console.log(`   ID: ${project.id}`);
    console.log(`   GitHub: ${project.githubUrl}`);
    
    // Get all commits for this project
    const commits = await prisma.comment.findMany({
      where: {
        projectId: projectId
      },
      orderBy: {
        commitDate: 'desc'
      }
    });
    
    console.log(`\\n📊 Total commits found: ${commits.length}`);
    console.log('='.repeat(60));
    
    commits.forEach((commit, index) => {
      console.log(`\\n${index + 1}. Commit: ${commit.commitHash.substring(0, 7)}`);
      console.log(`   Message: ${commit.commitMessage.split('\\n')[0]}`);
      console.log(`   Date: ${commit.commitDate?.toISOString()}`);
      console.log(`   Has Summary: ${commit.summary ? 'YES' : 'NO'}`);
      if (commit.summary) {
        console.log(`   Summary: ${commit.summary.substring(0, 100)}...`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkManishProject();
