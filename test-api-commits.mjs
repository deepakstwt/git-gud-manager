import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function testAPICommits() {
  try {
    // Find the manish project
    const manishProject = await db.project.findFirst({
      where: { name: 'manish' }
    });
    
    if (!manishProject) {
      console.log('❌ Manish project not found');
      return;
    }
    
    console.log(`✅ Found manish project: ${manishProject.id}`);
    
    // Get commits for the manish project (same query as the API)
    const commits = await db.comment.findMany({
      where: { projectId: manishProject.id },
      orderBy: { commitDate: 'desc' },
      take: 15,
    });
    
    console.log('\n📊 Commits returned by API query:');
    console.log(`Total commits: ${commits.length}\n`);
    
    commits.forEach((commit, index) => {
      console.log(`${index + 1}. ${commit.commitHash.substring(0, 7)} - ${commit.commitMessage.substring(0, 50)}...`);
      if (commit.summary) {
        console.log(`   ✅ HAS AI Summary: ${commit.summary.substring(0, 80)}...`);
      } else {
        console.log(`   ❌ NO AI Summary`);
      }
      console.log(`   📅 Date: ${commit.commitDate}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

testAPICommits();
