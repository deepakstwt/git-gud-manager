import { loadGitHubRepository } from './github-loader';
import { summarizeDocument, getEmbeddings } from './embeddings';
import { db } from '@/server/db';
import type { Document } from 'langchain/document';

/**
 * Index a GitHub repository for RAG with PGVector embeddings
 * @param projectId - Project ID to associate documents with
 * @param githubUrl - GitHub repository URL
 * @param githubToken - Optional GitHub access token
 * @returns Promise with processing results
 */
export async function indexGithubRepo(
  projectId: string,
  githubUrl: string,
  githubToken?: string
): Promise<{
  success: boolean;
  processedCount: number;
  skippedCount: number;
  errors: string[];
}> {
  console.log(`🚀 Starting GitHub RAG indexing for: ${githubUrl}`);
  
  const results = {
    success: false,
    processedCount: 0,
    skippedCount: 0,
    errors: [] as string[]
  };

  try {
    // Step 1: Load repo documents
    console.log('📂 Loading repository files...');
    const docs = await loadGitHubRepository(githubUrl, githubToken);
    console.log(`✅ Loaded ${docs.length} files from repository`);

    if (docs.length === 0) {
      console.warn('⚠️ No documents found in repository');
      return { ...results, success: true };
    }

    // Step 2: Filter relevant files
    const relevantDocs = filterRelevantDocuments(docs);
    console.log(`📋 Processing ${relevantDocs.length} relevant files (skipped ${docs.length - relevantDocs.length})`);
    results.skippedCount = docs.length - relevantDocs.length;

    // Step 3: Process each document
    const processPromises = relevantDocs.map(async (doc, index) => {
      const fileName = extractFileName(doc);
      console.log(`📄 Processing file ${index + 1}/${relevantDocs.length}: ${fileName}`);
      
      try {
        // Step 3a: Summarize the code
        console.log(`🤖 Generating summary for: ${fileName}`);
        const summary = await summarizeCode(doc);
        console.log(`✅ Generated summary for: ${fileName}`);

        // Step 3b: Generate embedding
        console.log(`🧮 Generating embedding for: ${fileName}`);
        const embedding = await generateEmbedding(summary);
        console.log(`✅ Generated embedding for: ${fileName}`);

        return {
          success: true,
          fileName,
          filePath: doc.metadata?.source || fileName,
          summary,
          embedding,
          sourceCode: doc.pageContent || ''
        };
      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error);
        return {
          success: false,
          fileName,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    // Step 4: Wait for all processing to complete
    console.log('⏳ Waiting for all documents to be processed...');
    const processResults = await Promise.allSettled(processPromises);

    // Step 5: Store in database
    console.log('💾 Storing results in database...');
    let successCount = 0;

    for (let i = 0; i < processResults.length; i++) {
      const result = processResults[i];
      
      if (!result) continue;
      
      if (result.status === 'fulfilled' && result.value.success) {
        const { fileName, filePath, summary, embedding, sourceCode } = result.value;
        
        // Ensure all required fields are present
        if (!summary || !sourceCode) {
          results.errors.push(`Missing required data for ${fileName}`);
          continue;
        }
        
        try {
          // First, insert the record without embedding
          const record = await db.sourceCodeEmbedding.create({
            data: {
              projectId,
              fileName,
              filePath,
              summary,
              source: sourceCode
            }
          });

          // Then, update with the vector embedding using raw SQL
          await db.$executeRaw`
            UPDATE "SourceCodeEmbedding"
            SET embedding = ${embedding as any}::vector
            WHERE id = ${record.id};
          `;

          console.log(`✅ Stored embedding for: ${fileName}`);
          successCount++;
        } catch (dbError) {
          console.error(`❌ Database error for ${fileName}:`, dbError);
          results.errors.push(`Database error for ${fileName}: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }
      } else if (result.status === 'fulfilled' && !result.value.success) {
        results.errors.push(`Processing error for ${result.value.fileName}: ${result.value.error}`);
      } else if (result.status === 'rejected') {
        results.errors.push(`Promise rejected: ${result.reason}`);
      }
    }

    results.processedCount = successCount;
    results.success = true;

    console.log(`🎉 GitHub RAG indexing completed!`);
    console.log(`📊 Results: ${successCount} processed, ${results.skippedCount} skipped, ${results.errors.length} errors`);

    return results;
  } catch (error) {
    console.error('❌ Fatal error during GitHub RAG indexing:', error);
    results.errors.push(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return results;
  }
}

/**
 * Summarize code using Gemini AI
 * @param doc - Document containing code
 * @returns Promise<string> - Summary of the code
 */
async function summarizeCode(doc: Document): Promise<string> {
  const fileName = extractFileName(doc);
  const pageContent = doc.pageContent;
  
  // Use the existing summarizeDocument function
  return await summarizeDocument(pageContent, fileName);
}

/**
 * Generate embedding for text using Gemini
 * @param text - Text to generate embedding for
 * @returns Promise<number[]> - Array of embedding values (768 dimensions)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Use the existing getEmbeddings function
  return await getEmbeddings(text);
}

/**
 * Filter documents to only include relevant code files
 * @param docs - All documents from repository
 * @returns Filtered array of relevant documents
 */
function filterRelevantDocuments(docs: Document[]): Document[] {
  return docs.filter(doc => {
    const source = doc.metadata?.source || '';
    const content = doc.pageContent || '';
    
    // Skip empty files
    if (content.trim().length === 0) return false;
    
    // Skip very large files (>100KB)
    if (content.length > 100000) return false;
    
    // Skip binary-like files and include only text-based code files
    const extension = source.split('.').pop()?.toLowerCase();
    const codeExtensions = [
      'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'hpp',
      'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'clj',
      'md', 'txt', 'json', 'yml', 'yaml', 'xml', 'css', 'scss', 'less',
      'html', 'vue', 'svelte', 'sql', 'sh', 'bash', 'dockerfile'
    ];
    
    if (!extension || !codeExtensions.includes(extension)) return false;
    
    // Skip common non-essential files
    const fileName = source.split('/').pop()?.toLowerCase() || '';
    const skipPatterns = [
      'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
      '.gitignore', '.env', '.env.example',
      'node_modules/', 'dist/', 'build/', '.git/'
    ];
    
    return !skipPatterns.some(pattern => 
      fileName.includes(pattern) || source.includes(pattern)
    );
  });
}

/**
 * Extract filename from document metadata
 * @param doc - Document to extract filename from
 * @returns Filename string
 */
function extractFileName(doc: Document): string {
  const source = doc.metadata?.source || 'unknown_file';
  return source.split('/').pop() || source;
}

/**
 * Query RAG system with vector similarity search
 * @param projectId - Project ID to search within
 * @param question - User's question
 * @param topK - Number of top similar documents to retrieve (default: 5)
 * @returns Promise with similar documents and AI-generated answer
 */
export async function queryRAGSystem(
  projectId: string,
  question: string,
  topK: number = 5
): Promise<{
  answer: string;
  sources: Array<{
    fileName: string;
    summary: string;
    sourceCode: string;
    similarity: number;
  }>;
}> {
  console.log(`🔍 Querying RAG system for: "${question}"`);
  
  try {
    // Step 1: Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);
    
    // Step 2: Find similar documents using PGVector cosine similarity
    const similarDocs = await db.$queryRaw`
      SELECT 
        "fileName",
        "summary",
        "source" as "sourceCode",
        1 - (embedding <=> ${questionEmbedding as any}::vector) as similarity
      FROM "SourceCodeEmbedding"
      WHERE "projectId" = ${projectId}
        AND embedding IS NOT NULL
      ORDER BY embedding <=> ${questionEmbedding as any}::vector
      LIMIT ${topK};
    ` as Array<{
      fileName: string;
      summary: string;
      sourceCode: string;
      similarity: number;
    }>;

    console.log(`📋 Found ${similarDocs.length} similar documents`);

    // Step 3: Generate answer using retrieved context
    const { generateRAGAnswer } = await import('./embeddings');
    const context = similarDocs.map(doc => `File: ${doc.fileName}\nSummary: ${doc.summary}\nCode snippet:\n${doc.sourceCode.slice(0, 1000)}...`);
    const answer = await generateRAGAnswer(question, context);

    return {
      answer,
      sources: similarDocs
    };
  } catch (error) {
    console.error('❌ Error querying RAG system:', error);
    return {
      answer: 'I apologize, but I encountered an error while searching for information about your question.',
      sources: []
    };
  }
}

export default {
  indexGithubRepo,
  queryRAGSystem,
};
