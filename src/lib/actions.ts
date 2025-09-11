'use server';

import { streamText } from 'ai';
import { db } from '@/server/db';
import { getEmbeddings } from '@/lib/embeddings';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '@/env';
import { auth } from '@clerk/nextjs/server';

// Initialize Google AI
const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY, // Use existing GEMINI_API_KEY
});

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

export async function askQuestion(projectId: string, question: string) {
  console.log(`🔍 Asking question for project ${projectId}: "${question}"`);
  
  // Get authenticated user
  const { userId } = await auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  try {
    // Step 1: Generate embedding for the question
    console.log('🧮 Generating question embedding...');
    const questionEmbedding = await getEmbeddings(question);
    
    // Step 2: Run PGVector similarity search
    console.log('🔍 Searching for similar documents...');
    const similarDocs = await db.$queryRaw`
      SELECT 
        "fileName",
        "summary", 
        "source" as "sourceCode",
        1 - (embedding <=> ${questionEmbedding as any}::vector) as similarity
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> ${questionEmbedding as any}::vector) > 0.5
      ORDER BY embedding <=> ${questionEmbedding as any}::vector
      LIMIT 10;
    ` as FileReference[];

    console.log(`📋 Found ${similarDocs.length} relevant documents`);

    // Step 3: Build context string
    const context = similarDocs
      .map(doc => `File: ${doc.fileName}\nSummary: ${doc.summary}\nCode:\n${doc.sourceCode}\n`)
      .join('\n---\n\n');

    // Step 4: Construct prompt
    const prompt = `You are an AI code assistant.
Use only the provided context to answer questions about this repo.

Context:
${context}

Question: ${question}

Answer:`;

    // Step 5: Generate complete response (not streaming for now)
    const result = await streamText({
      model: google('models/gemini-1.5-flash'),
      prompt,
      temperature: 0.3,
    });

    // Get the complete answer
    const fullAnswer = await result.text;

    // Step 6: Save to database
    console.log('💾 Saving question and answer to database...');
    await db.question.create({
      data: {
        projectId,
        userId,
        text: question,
        answer: fullAnswer,
        fileReferences: similarDocs as any, // Cast to satisfy Prisma Json type
      },
    });
    console.log('✅ Question processing completed');

    return {
      answer: fullAnswer,
      files: similarDocs,
    };
  } catch (error) {
    console.error('❌ Error in askQuestion:', error);
    throw new Error(`Failed to process question: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
