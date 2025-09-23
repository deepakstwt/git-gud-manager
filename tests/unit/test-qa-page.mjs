/**
 * Simple test to verify Q&A page functionality
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQAFunctionality() {
  console.log('🧪 Testing Q&A page functionality...\n');

  try {
    // 1. Check if Question model exists and has correct fields
    console.log('1. Testing Question model schema...');
    const questionSchema = await prisma.question.findFirst();
    console.log('✅ Question model accessible\n');

    // 2. Test if we can fetch questions with user relations
    console.log('2. Testing question queries with user relations...');
    const questions = await prisma.question.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            emailAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`✅ Found ${questions.length} questions with user data\n`);
    
    if (questions.length > 0) {
      console.log('Sample question data:');
      const sample = questions[0];
      console.log(`- ID: ${sample.id}`);
      console.log(`- Text: ${sample.text.slice(0, 50)}...`);
      console.log(`- User: ${sample.user.firstName || sample.user.emailAddress}`);
      console.log(`- Created: ${sample.createdAt}`);
      console.log('');
    }

    // 3. Test user-question relation
    console.log('3. Testing User-Question relationships...');
    const users = await prisma.user.findMany({
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            createdAt: true,
          },
        },
      },
    });
    
    const usersWithQuestions = users.filter(user => user.questions.length > 0);
    console.log(`✅ Found ${usersWithQuestions.length} users with questions\n`);

    console.log('🎉 Q&A functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testQAFunctionality();
