import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize and return a Gemini AI client
 * @returns GoogleGenerativeAI instance
 */
export async function getGeminiClient(): Promise<GoogleGenerativeAI> {
  const { env } = await import('@/env');
  
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

/**
 * Summarize a document/file content for RAG pipeline
 * @param content - The file content to summarize
 * @param fileName - The name of the file for context
 * @returns Promise<string> - Concise technical summary
 */
export async function summarizeDocument(content: string, fileName?: string): Promise<string> {
  try {
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
You are an expert code analyst. Provide a concise, technical summary of this file that will be useful for a RAG (Retrieval Augmented Generation) system.

File: ${fileName || 'Unknown file'}

Focus on:
1. **Purpose**: What this file does or contains
2. **Key functionality**: Main functions, classes, or concepts
3. **Dependencies**: Important imports or external connections
4. **Technical details**: APIs, patterns, or architectures used
5. **Context**: How this might relate to other parts of a project

Keep the summary under 200 words and make it searchable for relevant queries.

File content:
${content}
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    // Clean up and ensure reasonable length
    const cleanSummary = summary.trim();
    if (cleanSummary.length > 500) {
      return cleanSummary.substring(0, 497) + '...';
    }
    
    return cleanSummary;
  } catch (error) {
    console.error('Error generating document summary:', error);
    
    // Fallback to basic analysis
    return generateDocumentFallbackSummary(content, fileName);
  }
}

/**
 * Generate embeddings for text using Gemini embedding model
 * @param text - Text to convert to embeddings
 * @returns Promise<number[]> - Embedding vector
 */
export async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    if (!embedding.values || embedding.values.length === 0) {
      throw new Error('No embedding values returned from Gemini');
    }
    
    return embedding.values;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    
    // Fallback to a simple hash-based embedding (for development)
    return generateFallbackEmbedding(text);
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns number - Similarity score (0-1, higher is more similar)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    const aVal = a[i] ?? 0;
    const bVal = b[i] ?? 0;
    dotProduct += aVal * bVal;
    normA += aVal * aVal;
    normB += bVal * bVal;
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Generate answer using retrieved context and question
 * @param question - User's question
 * @param context - Retrieved document summaries
 * @returns Promise<string> - AI-generated answer
 */
export async function generateRAGAnswer(question: string, context: string[]): Promise<string> {
  try {
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const contextText = context.join('\n\n---\n\n');
    
    const prompt = `
You are a helpful AI assistant answering questions about a codebase. Use the provided context from relevant files to answer the user's question accurately and helpfully.

Context from relevant files:
${contextText}

User question: ${question}

Instructions:
1. Answer based primarily on the provided context
2. Be specific and mention file names when relevant
3. If the context doesn't contain enough information, say so
4. Provide practical, actionable information when possible
5. Keep the answer concise but complete

Answer:
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return response.text().trim();
  } catch (error) {
    console.error('Error generating RAG answer:', error);
    return 'I apologize, but I encountered an error while processing your question. Please try again.';
  }
}

/**
 * Fallback summary generation when AI is unavailable
 */
function generateDocumentFallbackSummary(content: string, fileName?: string): string {
  const lines = content.split('\n');
  const totalLines = lines.length;
  const extension = fileName?.split('.').pop()?.toLowerCase() || 'unknown';
  
  let summary = `📄 ${fileName || 'File'} (${extension.toUpperCase()}) - ${totalLines} lines. `;
  
  // Basic pattern detection
  const lowerContent = content.toLowerCase();
  
  if (extension === 'ts' || extension === 'tsx' || extension === 'js' || extension === 'jsx') {
    if (lowerContent.includes('function') || lowerContent.includes('=>')) {
      summary += '⚡ Contains function definitions. ';
    }
    if (lowerContent.includes('class ')) {
      summary += '🏗️ Defines classes. ';
    }
    if (lowerContent.includes('import ') || lowerContent.includes('require(')) {
      summary += '📦 Has dependencies. ';
    }
    if (lowerContent.includes('export ')) {
      summary += '📤 Exports functionality. ';
    }
  } else if (extension === 'md') {
    summary += '📚 Documentation file. ';
  } else if (extension === 'json') {
    summary += '⚙️ Configuration or data file. ';
  } else if (extension === 'css') {
    summary += '🎨 Styling definitions. ';
  }
  
  return summary + '(Basic analysis - AI unavailable)';
}

/**
 * Simple fallback embedding generation (for development)
 */
function generateFallbackEmbedding(text: string): number[] {
  // Create a simple hash-based embedding of fixed size (384 dimensions)
  const dimension = 384;
  const embedding = new Array(dimension).fill(0);
  
  // Simple hash function to generate consistent embeddings
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    const index = char % dimension;
    embedding[index] += char / 1000; // Normalize
  }
  
  // Normalize the vector
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] /= norm;
    }
  }
  
  return embedding;
}

export default {
  summarizeDocument,
  getEmbeddings,
  cosineSimilarity,
  generateRAGAnswer,
  getGeminiClient,
};
