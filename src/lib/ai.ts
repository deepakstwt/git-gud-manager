import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize and return a Gemini AI client
 * @returns GoogleGenerativeAI instance
 */
export function getGeminiClient(): GoogleGenerativeAI {
  const { env } = require('@/env');
  
  if (!env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  return new GoogleGenerativeAI(env.GEMINI_API_KEY);
}

/**
 * Summarize text using Google Gemini AI
 * @param text - The text to summarize (commit diff, message, etc.)
 * @returns Promise<string> - AI-generated summary
 */
export async function summarizeText(text: string): Promise<string> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
Analyze this Git commit and provide a concise, helpful summary. Focus on:
1. What type of change this is (feature, bugfix, refactor, etc.)
2. The main purpose and impact of the changes
3. Any important technical details

Keep the summary under 150 words and use a professional, informative tone.

Commit data:
${text}
`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    // Clean up the response and ensure it's not too long
    const cleanSummary = summary.trim();
    if (cleanSummary.length > 500) {
      return cleanSummary.substring(0, 497) + '...';
    }
    
    return cleanSummary;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    
    // Fallback to a basic analysis if AI fails
    return generateFallbackSummary(text);
  }
}

/**
 * Generate a basic fallback summary when AI fails
 * @param text - The commit text to analyze
 * @returns string - Basic pattern-based summary
 */
function generateFallbackSummary(text: string): string {
  const lowerText = text.toLowerCase();
  
  let summary = "📝 Code changes detected. ";
  
  // Simple pattern matching as fallback
  if (lowerText.includes('fix') || lowerText.includes('bug') || lowerText.includes('error')) {
    summary += "🐛 This appears to be a bug fix or error correction.";
  } else if (lowerText.includes('feat') || lowerText.includes('add') || lowerText.includes('new')) {
    summary += "✨ New feature or functionality has been added.";
  } else if (lowerText.includes('update') || lowerText.includes('modify') || lowerText.includes('change')) {
    summary += "🔄 Existing code has been updated or modified.";
  } else if (lowerText.includes('remove') || lowerText.includes('delete')) {
    summary += "🗑️ Code or features have been removed.";
  } else if (lowerText.includes('refactor')) {
    summary += "♻️ Code has been refactored for better structure.";
  } else if (lowerText.includes('doc') || lowerText.includes('readme')) {
    summary += "📚 Documentation has been updated.";
  } else if (lowerText.includes('test')) {
    summary += "🧪 Tests have been added or updated.";
  } else if (lowerText.includes('merge')) {
    summary += "🔀 Branch merge containing multiple changes.";
  } else {
    summary += "⚡ General improvements and updates.";
  }
  
  return summary + " (AI analysis unavailable - using pattern detection)";
}

/**
 * Test the Gemini AI connection
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const testSummary = await summarizeText("test: add unit tests for user authentication");
    console.log('✅ Gemini AI test successful:', testSummary);
    return true;
  } catch (error) {
    console.error('❌ Gemini AI test failed:', error);
    return false;
  }
}

export default {
  getGeminiClient,
  summarizeText,
  testGeminiConnection,
};
