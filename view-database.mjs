import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function viewDatabase() {
  try {
    console.log('🔍 DATABASE OVERVIEW');
    console.log('='.repeat(50));
    
    // Count records in each table
    const userCount = await db.user.count();
    const projectCount = await db.project.count();
    const commitCount = await db.comment.count();
    const userToProjectCount = await db.userToProject.count();
    
    console.log('\n📊 TABLE COUNTS:');
    console.log(`👤 Users: ${userCount}`);
    console.log(`📁 Projects: ${projectCount}`);
    console.log(`💬 Commits (Comments): ${commitCount}`);
    console.log(`🔗 User-Project Relations: ${userToProjectCount}`);
    
    // Show all users
    console.log('\n👤 USERS:');
    console.log('-'.repeat(30));
    const users = await db.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        emailAddress: true,
        createdAt: true,
      }
    });
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName || ''} ${user.lastName || ''}`);
      console.log(`   Email: ${user.emailAddress}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    // Show all projects
    console.log('\n📁 PROJECTS:');
    console.log('-'.repeat(30));
    const projects = await db.project.findMany({
      select: {
        id: true,
        name: true,
        githubUrl: true,
        createdAt: true,
        _count: {
          select: {
            commits: true,
            UserToProjects: true,
          }
        }
      }
    });
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   GitHub: ${project.githubUrl || 'None'}`);
      console.log(`   Commits: ${project._count.commits}`);
      console.log(`   Users: ${project._count.UserToProjects}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Created: ${project.createdAt.toLocaleDateString()}`);
      console.log('');
    });
    
    // Show commits with AI summaries
    console.log('\n💬 COMMITS WITH AI SUMMARIES:');
    console.log('-'.repeat(40));
    const commitsWithSummaries = await db.comment.findMany({
      where: {
        summary: {
          not: null
        }
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        commitDate: 'desc'
      }
    });
    
    commitsWithSummaries.forEach((commit, index) => {
      console.log(`${index + 1}. ${commit.commitHash.substring(0, 7)} - ${commit.project.name}`);
      console.log(`   Message: ${commit.commitMessage.substring(0, 60)}...`);
      console.log(`   Author: ${commit.commitAuthorName || 'Unknown'}`);
      console.log(`   Summary: ${commit.summary?.substring(0, 80)}...`);
      console.log(`   Date: ${commit.commitDate?.toLocaleDateString()}`);
      console.log('');
    });
    
    // Show commits without AI summaries
    console.log('\n❌ COMMITS WITHOUT AI SUMMARIES:');
    console.log('-'.repeat(40));
    const commitsWithoutSummaries = await db.comment.findMany({
      where: {
        summary: null
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        commitDate: 'desc'
      },
      take: 5 // Just show first 5
    });
    
    commitsWithoutSummaries.forEach((commit, index) => {
      console.log(`${index + 1}. ${commit.commitHash.substring(0, 7)} - ${commit.project.name}`);
      console.log(`   Message: ${commit.commitMessage.substring(0, 60)}...`);
      console.log(`   Author: ${commit.commitAuthorName || 'Unknown'}`);
      console.log(`   Date: ${commit.commitDate?.toLocaleDateString()}`);
      console.log('');
    });
    
    if (commitsWithoutSummaries.length === 5) {
      const totalWithoutSummaries = await db.comment.count({
        where: { summary: null }
      });
      console.log(`   ... and ${totalWithoutSummaries - 5} more commits without summaries`);
    }
    
  } catch (error) {
    console.error('❌ Error viewing database:', error);
  } finally {
    await db.$disconnect();
  }
}

viewDatabase();
