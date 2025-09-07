import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function finalVerification() {
  try {
    console.log('🎯 FINAL VERIFICATION: AI Summaries for Manish Project');
    console.log('='.repeat(60));
    
    // Get the manish project
    const manishProject = await db.project.findFirst({
      where: { name: 'manish' }
    });
    
    if (!manishProject) {
      console.log('❌ Manish project not found');
      return;
    }
    
    console.log(`✅ Project: ${manishProject.name} (ID: ${manishProject.id})`);
    console.log(`🔗 GitHub: ${manishProject.githubUrl}`);
    
    // Get commits (same query as frontend API)
    const commits = await db.comment.findMany({
      where: { projectId: manishProject.id },
      orderBy: { commitDate: 'desc' },
      take: 15,
    });
    
    console.log(`\n📊 Total commits in database: ${commits.length}`);
    const commitsWithSummaries = commits.filter(c => c.summary);
    console.log(`🤖 Commits with AI summaries: ${commitsWithSummaries.length}`);
    
    console.log('\n🔍 Commit Details:');
    commits.forEach((commit, index) => {
      const hasAI = commit.summary ? '✅ AI' : '❌ No AI';
      console.log(`${index + 1}. ${commit.commitHash.substring(0, 7)} - ${hasAI}`);
      console.log(`   📝 ${commit.commitMessage.substring(0, 60)}...`);
      if (commit.summary) {
        console.log(`   🤖 Summary: ${commit.summary.substring(0, 80)}...`);
      }
      console.log('');
    });
    
    console.log('✅ Dashboard should now display:');
    console.log(`   - ${commits.length} total commits for "manish" project`);
    console.log(`   - ${commitsWithSummaries.length} commits with green "AI Summary" boxes`);
    console.log(`   - ${commits.length - commitsWithSummaries.length} commits with blue "No AI summary available" boxes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await db.$disconnect();
  }
}

finalVerification();
