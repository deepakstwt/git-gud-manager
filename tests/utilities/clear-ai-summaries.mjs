#!/usr/bin/env node

/**
 * Clear AI summaries to test regeneration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAISummaries() {
  try {
    console.log('🧹 Clearing AI summaries to test regeneration...');
    
    // Clear all AI summaries (set them to empty string or null)
    const result = await prisma.comment.updateMany({
      where: {
        summary: {
          not: null
        }
      },
      data: {
        summary: ""
      }
    });
    
    console.log(`✅ Cleared ${result.count} AI summaries`);
    console.log('🔄 Now you can test the "Poll Commits" feature to regenerate them');
    
  } catch (error) {
    console.error('❌ Error clearing summaries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAISummaries();
