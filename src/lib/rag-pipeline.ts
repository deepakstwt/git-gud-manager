import { loadGitHubRepository } from './github-loader';
import { summarizeDocument, getEmbeddings, cosineSimilarity, generateRAGAnswer } from './embeddings';
import { db } from '@/server/db';

/**
 * Process a GitHub repository through the complete RAG pipeline
 * @param projectId - Project ID to associate documents with
 * @param githubUrl - GitHub repository URL
 * @param githubToken - Optional GitHub access token
 * @returns Promise<ProcessingResult> - Results of the processing
 */
export async function processRepositoryForRAG(
  projectId: string,
  githubUrl: string,
  githubToken?: string
): Promise<{
  success: boolean;
  processedCount: number;
  skippedCount: number;
  errors: string[];
}> {
  console.log(`🚀 Starting RAG processing for repository: ${githubUrl}`);
  
  const results = {
    success: false,
    processedCount: 0,
    skippedCount: 0,
    errors: [] as string[]
  };

  try {
    // Step 1: Load repository files
    console.log('📂 Loading repository files...');
    const documents = await loadGitHubRepository(githubUrl, githubToken);
    console.log(`✅ Loaded ${documents.length} files`);

    // Step 2: Filter relevant files (skip binary, very large, or irrelevant files)
    const relevantDocs = documents.filter(doc => {
      const source = doc.metadata?.source || '';
      const content = doc.pageContent || '';
      
      // Skip empty files
      if (content.trim().length === 0) return false;
      
      // Skip very large files (>50KB)
      if (content.length > 50000) return false;
      
      // Skip binary-like files
      const extension = source.split('.').pop()?.toLowerCase();
      const textExtensions = ['ts', 'tsx', 'js', 'jsx', 'py', 'md', 'txt', 'json', 'yml', 'yaml', 'css', 'scss', 'html', 'vue', 'svelte'];
      
      return extension ? textExtensions.includes(extension) : true;
    });

    console.log(`🔍 Filtered to ${relevantDocs.length} relevant files`);

    // Step 3: Process each document
    for (const doc of relevantDocs) {
      try {
        const fileName = doc.metadata?.source || 'unknown';
        const filePath = fileName;
        const content = doc.pageContent || '';

        console.log(`📝 Processing: ${fileName}`);

        // Check if document already exists
        const existingDoc = await db.document.findUnique({
          where: {
            projectId_fileName: {
              projectId,
              fileName
            }
          }
        });

        if (existingDoc) {
          console.log(`⏭️  Skipping ${fileName} - already exists`);
          results.skippedCount++;
          continue;
        }

        // Step 3a: Generate summary
        const summary = await summarizeDocument(content, fileName);
        
        // Step 3b: Generate embeddings
        const embedding = await getEmbeddings(summary);
        
        // Step 3c: Store in database
        await db.document.create({
          data: {
            projectId,
            fileName,
            filePath,
            content,
            summary,
            embedding: JSON.stringify(embedding) // Store as JSON string
          }
        });

        console.log(`✅ Processed: ${fileName}`);
        results.processedCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        const fileName = doc.metadata?.source || 'unknown';
        const errorMsg = `Failed to process ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    results.success = true;
    console.log(`🎉 RAG processing complete! Processed: ${results.processedCount}, Skipped: ${results.skippedCount}, Errors: ${results.errors.length}`);
    
  } catch (error) {
    const errorMsg = `RAG processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    results.errors.push(errorMsg);
  }

  return results;
}

/**
 * Query the RAG system with a natural language question
 * @param projectId - Project ID to search within
 * @param question - User's question
 * @param topK - Number of top similar documents to retrieve (default: 5)
 * @returns Promise<RAGQueryResult> - Answer and retrieved context
 */
export async function queryRAG(
  projectId: string,
  question: string,
  topK: number = 5
): Promise<{
  answer: string;
  context: Array<{
    fileName: string;
    summary: string;
    similarity: number;
  }>;
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`🔍 RAG Query: "${question}"`);

    // Step 1: Generate embedding for the question
    const questionEmbedding = await getEmbeddings(question);

    // Step 2: Retrieve all documents for the project
    const documents = await db.document.findMany({
      where: { projectId },
      select: {
        fileName: true,
        summary: true,
        embedding: true
      }
    });

    if (documents.length === 0) {
      return {
        answer: 'No documents found for this project. Please process the repository first.',
        context: [],
        success: false,
        error: 'No documents found'
      };
    }

    // Step 3: Calculate similarities and find top-k
    const similarities = documents.map(doc => {
      try {
        const docEmbedding = JSON.parse(doc.embedding || '[]') as number[];
        const similarity = cosineSimilarity(questionEmbedding, docEmbedding);
        
        return {
          fileName: doc.fileName,
          summary: doc.summary,
          similarity
        };
      } catch (error) {
        console.error(`Error processing embedding for ${doc.fileName}:`, error);
        return {
          fileName: doc.fileName,
          summary: doc.summary,
          similarity: 0
        };
      }
    });

    // Sort by similarity (highest first) and take top-k
    const topDocuments = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`📋 Found ${topDocuments.length} relevant documents`);
    topDocuments.forEach((doc, i) => {
      console.log(`  ${i + 1}. ${doc.fileName} (similarity: ${doc.similarity.toFixed(3)})`);
    });

    // Step 4: Generate answer using retrieved context
    const contextSummaries = topDocuments.map(doc => 
      `File: ${doc.fileName}\nSummary: ${doc.summary}`
    );
    
    const answer = await generateRAGAnswer(question, contextSummaries);

    return {
      answer,
      context: topDocuments,
      success: true
    };

  } catch (error) {
    const errorMsg = `RAG query failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    
    return {
      answer: 'I apologize, but I encountered an error while processing your question. Please try again.',
      context: [],
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Get project statistics for RAG system
 * @param projectId - Project ID
 * @returns Promise<RAGStats> - Statistics about processed documents
 */
export async function getRAGStats(projectId: string): Promise<{
  totalDocuments: number;
  totalSummaries: number;
  totalEmbeddings: number;
  fileTypes: Record<string, number>;
  avgSummaryLength: number;
}> {
  const documents = await db.document.findMany({
    where: { projectId },
    select: {
      fileName: true,
      summary: true,
      embedding: true
    }
  });

  const stats = {
    totalDocuments: documents.length,
    totalSummaries: documents.filter(d => d.summary).length,
    totalEmbeddings: documents.filter(d => d.embedding).length,
    fileTypes: {} as Record<string, number>,
    avgSummaryLength: 0
  };

  // Calculate file type distribution
  documents.forEach(doc => {
    const extension = doc.fileName.split('.').pop()?.toLowerCase() || 'unknown';
    stats.fileTypes[extension] = (stats.fileTypes[extension] || 0) + 1;
  });

  // Calculate average summary length
  const summaries = documents.filter(d => d.summary).map(d => d.summary);
  if (summaries.length > 0) {
    const totalLength = summaries.reduce((sum, summary) => sum + summary.length, 0);
    stats.avgSummaryLength = Math.round(totalLength / summaries.length);
  }

  return stats;
}

/**
 * Clear all RAG data for a project
 * @param projectId - Project ID
 * @returns Promise<number> - Number of documents deleted
 */
export async function clearRAGData(projectId: string): Promise<number> {
  const result = await db.document.deleteMany({
    where: { projectId }
  });
  
  console.log(`🗑️  Cleared ${result.count} documents for project ${projectId}`);
  return result.count;
}

export default {
  processRepositoryForRAG,
  queryRAG,
  getRAGStats,
  clearRAGData,
};
