## 🧪 RAG Pipeline Testing Instructions

### **Current Project Status:**
- ✅ Project: My Portfolio (deepakartist/My_Portfolio_Man)
- ✅ GitHub URL: https://github.com/deepakartist/My_Portfolio_Man
- ❌ **Not Indexed Yet** (0 embeddings in database)

### **Test the PGVector RAG Pipeline:**

#### **Phase 1: Index the Repository**
1. **Go to the "Ask a question" section** in your dashboard
2. **Click on the "PGVector RAG (New)" tab** (should be the default)
3. **Click "Index Repository"** button - This will:
   - Clone the GitHub repository
   - Analyze all code files
   - Generate AI summaries using Gemini
   - Create embeddings for each file
   - Store everything in PGVector database

**Expected Result:** 
- Index Status should show indexed files count
- Process takes 2-5 minutes depending on repo size

#### **Phase 2: Ask Questions**
After indexing is complete, test these queries:

1. **Architecture Questions:**
   - "What is the overall structure of this portfolio website?"
   - "What technologies and frameworks are used in this project?"
   - "How is the project organized?"

2. **Specific Code Questions:**
   - "How does the navigation work?"
   - "What components are available?"
   - "How is styling implemented?"
   - "Are there any API endpoints?"

3. **Implementation Questions:**
   - "How can I add a new section to the portfolio?"
   - "What files would I need to modify to change the theme?"
   - "How is the responsive design handled?"

#### **Phase 3: Compare with Classic RAG**
1. **Switch to "Classic RAG" tab**
2. **Click "Process Repository"** (this uses the old method)
3. **Ask the same questions** and compare results

### **What to Look For:**

✅ **Success Indicators:**
- Repository indexes without errors
- Questions return relevant, accurate answers
- Answers reference specific files from your repo
- PGVector results are more detailed than Classic RAG
- Response time under 10 seconds

❌ **Issues to Check:**
- Indexing fails (check Gemini API key)
- Empty or generic answers
- Error messages in responses
- Very slow responses (>30 seconds)

### **Advanced Testing:**

#### **Test Different Query Types:**
1. **Factual:** "What files are in the src directory?"
2. **Conceptual:** "How does this website handle user interactions?"
3. **Procedural:** "How would I deploy this project?"
4. **Comparative:** "What's the difference between the components?"

#### **Test Edge Cases:**
1. Ask about non-existent features
2. Ask very specific technical questions
3. Ask about dependencies and configuration
4. Ask about potential improvements

### **Monitoring Tools:**

Check these during testing:
- Browser Developer Console (F12) for any errors
- Network tab to see API calls
- Database embeddings count (run `node check-embeddings.mjs`)

---

### **Quick Test Commands:**

```bash
# Check if embeddings are being created
node check-embeddings.mjs

# Monitor the development server
# (Look for any error messages in terminal)

# Test direct API if needed
node test-github-rag-indexer.mjs
```

### **Expected Timeline:**
- **Setup:** 1 minute
- **Indexing:** 3-5 minutes (depends on repo size)
- **Each Question:** 5-15 seconds
- **Full Test:** 15-20 minutes

---

**🎯 Goal:** The RAG system should understand your portfolio codebase and answer questions as if it's a knowledgeable developer who has read all your code!
