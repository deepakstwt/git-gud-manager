import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function monitorRAGTesting() {
  console.log('🔍 RAG Pipeline Testing Monitor\n');
  console.log('Run this script while testing to see live updates...\n');
  
  let lastCount = 0;
  
  while (true) {
    try {
      // Check embedding count
      const currentCount = await prisma.sourceCodeEmbedding.count();
      
      if (currentCount !== lastCount) {
        console.log(`📈 Embeddings updated: ${lastCount} → ${currentCount} (+${currentCount - lastCount})`);
        
        if (currentCount > 0) {
          // Show latest embedding
          const latest = await prisma.sourceCodeEmbedding.findFirst({
            orderBy: { createdAt: 'desc' },
            select: {
              filePath: true,
              summary: true,
              createdAt: true
            }
          });
          
          if (latest) {
            console.log(`   📄 Latest: ${latest.filePath}`);
            console.log(`   📝 Summary: ${latest.summary?.substring(0, 80)}...`);
            console.log(`   🕐 Time: ${latest.createdAt.toLocaleTimeString()}\n`);
          }
        }
        
        lastCount = currentCount;
      } else if (currentCount === 0) {
        console.log(`⏳ Waiting for indexing to start... (${new Date().toLocaleTimeString()})`);
      } else {
        console.log(`✅ Stable at ${currentCount} embeddings (${new Date().toLocaleTimeString()})`);
      }
      
      // Wait 3 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error('❌ Monitor error:', error);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  console.log('\n👋 Stopping monitor...');
  await prisma.$disconnect();
  process.exit(0);
});

monitorRAGTesting();
