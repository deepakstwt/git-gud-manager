import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function getManishProjectId() {
  try {
    const manishProject = await db.project.findFirst({
      where: { name: 'manish' }
    });
    
    if (manishProject) {
      console.log('✅ Manish project ID:', manishProject.id);
    } else {
      console.log('❌ Manish project not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.$disconnect();
  }
}

getManishProjectId();
