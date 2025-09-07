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
 * Summarize a commit diff using Gemini-1.5-flash
 * @param diff - The commit diff as a string
 * @returns Promise<string> - AI-generated summary
 */
export async function summarizeCommit(diff: string): Promise<string> {
  try {
    const genAI = await getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const systemPrompt = `
You are an expert software engineer analyzing Git commit diffs. Your task is to provide concise, insightful summaries of code changes.

**Git Diff Format Guide:**
- Lines starting with "+" are additions
- Lines starting with "-" are deletions  
- Lines starting with "@@" show line numbers and context
- File headers start with "diff --git" or "--- a/" and "+++ b/"

**Examples:**

Input Diff:
\`\`\`
+++ b/src/components/Button.tsx
@@ -10,6 +10,8 @@
   return (
-    <button className="btn">
+    <button className="btn btn-primary" onClick={onClick}>
       {children}
     </button>
\`\`\`

Expected Summary: "🎨 Enhanced Button component: Added primary styling class and onClick handler support for improved interactivity."

**Your Task:**
1. Identify the type of change (feature ✨, bugfix 🐛, refactor ♻️, docs 📚, etc.)
2. Summarize what was changed and why it matters
3. Keep it under 100 words, technical but accessible
4. Start with an appropriate emoji
5. Focus on business impact when possible

Analyze this commit diff:

${diff}
`;
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const summary = response.text();
    
    // Clean up the response and ensure it's concise
    const cleanSummary = summary.trim();
    if (cleanSummary.length > 300) {
      return cleanSummary.substring(0, 297) + '...';
    }
    
    return cleanSummary;
  } catch (error) {
    console.error('Error generating commit summary with Gemini:', error);
    
    // Fallback to basic pattern analysis
    return generateFallbackSummary(diff);
  }
}

/**
 * Generate a basic fallback summary when AI fails
 * @param diff - The commit diff text
 * @returns string - Basic pattern-based summary
 */
function generateFallbackSummary(diff: string): string {
  const lowerDiff = diff.toLowerCase();
  
  // Count additions and deletions
  const additions = (diff.match(/^\+/gm) || []).length;
  const deletions = (diff.match(/^-/gm) || []).length;
  
  let summary = "📝 Code changes detected. ";
  
  // Simple pattern matching as fallback
  if (lowerDiff.includes('fix') || lowerDiff.includes('bug') || lowerDiff.includes('error')) {
    summary += `🐛 Bug fix with ${additions} additions and ${deletions} deletions.`;
  } else if (lowerDiff.includes('feat') || lowerDiff.includes('add') || lowerDiff.includes('new')) {
    summary += `✨ New feature added with ${additions} additions and ${deletions} deletions.`;
  } else if (lowerDiff.includes('update') || lowerDiff.includes('modify') || lowerDiff.includes('change')) {
    summary += `🔄 Code updated with ${additions} additions and ${deletions} deletions.`;
  } else if (lowerDiff.includes('remove') || lowerDiff.includes('delete')) {
    summary += `🗑️ Code removed with ${additions} additions and ${deletions} deletions.`;
  } else if (lowerDiff.includes('refactor')) {
    summary += `♻️ Code refactored with ${additions} additions and ${deletions} deletions.`;
  } else if (lowerDiff.includes('doc') || lowerDiff.includes('readme')) {
    summary += `📚 Documentation updated with ${additions} additions and ${deletions} deletions.`;
  } else if (lowerDiff.includes('test')) {
    summary += `🧪 Tests updated with ${additions} additions and ${deletions} deletions.`;
  } else {
    summary += `⚡ General improvements: +${additions} -${deletions} lines.`;
  }
  
  return summary + " (AI analysis unavailable)";
}

/**
 * Test the Gemini AI connection with a sample diff
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const sampleDiff = `
diff --git a/src/auth.ts b/src/auth.ts
index 1234567..abcdefg 100644
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -10,4 +10,6 @@
 export function login(email: string, password: string) {
+  if (!email || !password) {
+    throw new Error('Email and password are required');
+  }
   return authenticateUser(email, password);
 }
`;
    
    const testSummary = await summarizeCommit(sampleDiff);
    console.log('✅ Gemini AI test successful:', testSummary);
    return true;
  } catch (error) {
    console.error('❌ Gemini AI test failed:', error);
    return false;
  }
}

export default {
  getGeminiClient,
  summarizeCommit,
  testGeminiConnection,
};
