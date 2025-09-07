import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmbeddings() {
  try {
    console.log('📊 Checking current embedding status...\n');
    
    // Check if we have any embeddings
    const embeddingCount = await prisma.sourceCodeEmbedding.count();
    console.log(`📁 Total embeddings in database: ${embeddingCount}`);
    
    if (embeddingCount > 0) {
      // Get stats by project
      const embeddingsByProject = await prisma.sourceCodeEmbedding.groupBy({
        by: ['projectId'],
        _count: {
          id: true
        }
      });
      
      console.log('\n📋 Embeddings by project:');
      for (const group of embeddingsByProject) {
        const project = await prisma.project.findUnique({
          where: { id: group.projectId },
          select: { name: true, githubUrl: true }
        });
        console.log(`  Project: ${project?.name || 'Unknown'} (${project?.githubUrl || 'No URL'}) - ${group._count.id} embeddings`);
      }
      
      // Show recent embeddings
      const recentEmbeddings = await prisma.sourceCodeEmbedding.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          filePath: true,
          summary: true,
          createdAt: true,
          project: {
            select: { name: true }
          }
        }
      });
      
      console.log('\n🕒 Recent embeddings:');
      recentEmbeddings.forEach((emb, i) => {
        console.log(`  ${i + 1}. ${emb.filePath} (${emb.project?.name})`);
        console.log(`     Summary: ${emb.summary?.substring(0, 100)}...`);
        console.log(`     Created: ${emb.createdAt.toLocaleString()}\n`);
      });
    } else {
      console.log('\n⚠️  No embeddings found in database.');
      console.log('💡 You need to index a repository first using the RAG interface.');
    }
    
  } catch (error) {
    console.error('❌ Error checking embeddings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEmbeddings();
