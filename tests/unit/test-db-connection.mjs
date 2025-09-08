import { db } from '../../src/server/db';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    const userCount = await db.user.count();
    console.log('User count:', userCount);
    
    const projectCount = await db.project.count();
    console.log('Project count:', projectCount);
    
    console.log('Database test successful!');
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testDatabase();
