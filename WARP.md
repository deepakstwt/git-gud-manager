# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Git Gud Manager is an intelligent GitHub repository management system featuring AI-powered commit analysis and semantic search capabilities. It combines Next.js 15, TypeScript, PostgreSQL with pgvector, and Google Gemini AI to provide advanced code analysis and retrieval-augmented generation (RAG) for codebases.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Database Operations
```bash
# Generate Prisma client and run migrations
npm run db:generate

# Deploy migrations to production
npm run db:migrate

# Push schema changes without migrations
npm run db:push

# Open Prisma Studio for database inspection
npm run db:studio
```

### Code Quality & Testing
```bash
# Run linting with auto-fix
npm run lint:fix

# Check TypeScript types
npm run typecheck

# Format code with Prettier
npm run format:write

# Check code formatting
npm run format:check

# Run all tests
npm run test:all

# Test AI functionality
npm run test:ai

# Test database connectivity
npm run test:database
```

### System Utilities
```bash
# Check AI summary generation status
npm run utility:check-summaries

# View database contents
npm run utility:view-db

# Clear AI summaries
npm run utility:clear-summaries

# Verify system implementation
npm run verify:implementation
```

## Architecture Overview

### Core Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8.2
- **Database**: PostgreSQL with pgvector extension for vector embeddings
- **ORM**: Prisma 6.5.0
- **Authentication**: Clerk (configured for user management)
- **AI**: Google Gemini (gemini-1.5-flash for text, text-embedding-004 for embeddings)
- **API**: tRPC for type-safe client-server communication
- **UI**: Tailwind CSS with Radix UI components (shadcn/ui)

### Key Architectural Components

#### 1. AI Integration (`src/lib/ai.ts`)
- **Primary AI Model**: Google Gemini (gemini-1.5-flash)
- **Fallback System**: Pattern-based analysis when AI is unavailable
- **Core Functions**: `summarizeText()`, `getGeminiClient()`, `testGeminiConnection()`
- **Smart Prompting**: Structured prompts for commit analysis focusing on change type, impact, and technical details

#### 2. RAG Pipeline (`src/lib/rag-pipeline.ts`)
- **Document Processing**: `processRepositoryForRAG()` - Complete pipeline from GitHub repo to searchable embeddings
- **Semantic Search**: `queryRAG()` - Natural language querying with cosine similarity
- **Vector Embeddings**: Uses Gemini text-embedding-004 for document vectorization
- **File Filtering**: Automatic filtering of binary files, large files (>50KB), and irrelevant file types

#### 3. Database Schema (Key Models)
- **Document**: Stores file content, AI summaries, and embeddings for RAG
- **Comment**: GitHub commit data with AI-generated summaries
- **Project**: Repository metadata and relationships
- **Question**: User queries and AI responses with file references
- **SourceCodeEmbedding**: Alternative embedding storage with pgvector

#### 4. tRPC API Structure
- **Project Router**: CRUD operations for GitHub repositories
- **RAG Router**: Repository processing, querying, and statistics
- **Type Safety**: Full end-to-end type safety from database to frontend

### File Organization Patterns

```
src/
├── app/                    # Next.js App Router pages
│   ├── (protected)/        # Protected routes requiring authentication
│   ├── api/                # API routes and tRPC endpoints
│   └── sign-in/           # Authentication pages
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Feature-specific components
├── lib/                  # Core business logic
│   ├── ai.ts            # Gemini AI integration
│   ├── rag-pipeline.ts  # RAG processing pipeline
│   ├── embeddings.ts    # Embedding generation and similarity
│   ├── github*.ts       # GitHub API integration
│   └── database.ts      # Database utilities
├── server/              # tRPC server configuration
│   ├── api/routers/     # API route handlers
│   └── db.ts           # Prisma client instance
└── hooks/              # React hooks for state management
```

## Environment Configuration

### Required Environment Variables
```bash
DATABASE_URL="postgresql://..."           # PostgreSQL with pgvector
GITHUB_TOKEN="ghp_..."                   # GitHub Personal Access Token
GEMINI_API_KEY="AIza..."                # Google Gemini API Key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."  # Clerk Auth (public)
CLERK_SECRET_KEY="..."                   # Clerk Auth (secret)
```

### Database Setup
1. Install pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
2. Run setup script: `psql -d database -f setup-pgvector.sql`
3. Generate Prisma client: `npm run db:generate`

## Development Workflow Patterns

### Adding New AI Features
1. Extend `src/lib/ai.ts` with new functions
2. Update prompts in structured format with clear instructions
3. Always implement fallback patterns for when AI is unavailable
4. Test with `npm run test:ai`

### RAG Pipeline Extensions
1. Modify file filtering logic in `rag-pipeline.ts` if needed
2. Update embedding generation in `src/lib/embeddings.ts`
3. Test end-to-end with actual repositories using test scripts
4. Monitor database storage efficiency

### Adding New tRPC Endpoints
1. Create procedures in appropriate router (`src/server/api/routers/`)
2. Use Zod schemas for input validation
3. Leverage existing database patterns and error handling
4. Update frontend components to use new procedures

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Generate migration: `npm run db:generate`
3. Test migration with `npm run db:push` in development
4. Deploy with `npm run db:migrate` in production

## Testing Approach

The project includes comprehensive testing across multiple layers:

- **Unit Tests** (`tests/unit/`): Individual function testing
- **Integration Tests** (`tests/integration/`): End-to-end pipeline testing
- **AI Tests**: Direct Gemini API testing and fallback verification
- **Database Tests**: Connection and CRUD operation verification
- **RAG Tests**: Complete repository processing and querying

### Running Specific Tests
```bash
# Test AI integration specifically
node tests/unit/test-gemini-direct.mjs

# Test RAG pipeline end-to-end
node tests/unit/test-github-rag-indexer.mjs

# Monitor RAG processing
node tests/integration/monitor-rag-testing.mjs
```

## Key Implementation Notes

### AI Model Configuration
- **Text Generation**: Uses `gemini-1.5-flash` for fast, cost-effective summaries
- **Embeddings**: Uses `text-embedding-004` for high-quality vector representations
- **Rate Limiting**: Built-in delays and error handling for API limits
- **Token Management**: Automatic content truncation to stay within model limits

### Vector Search Implementation
- **Storage**: Embeddings stored as JSON strings in PostgreSQL
- **Similarity**: Cosine similarity for document ranking
- **Top-K Retrieval**: Configurable number of relevant documents (default: 5)
- **Context Assembly**: Intelligent context compilation for AI answer generation

### Performance Considerations
- File size limits (50KB max) to prevent processing overhead
- Concurrent processing with rate limiting for repository indexing
- Efficient database queries with proper indexing
- Memory-conscious embedding storage and retrieval

### Error Handling Patterns
- Graceful AI fallbacks throughout the system
- Comprehensive logging for debugging
- User-friendly error messages
- Transaction safety for database operations

## Common Development Tasks

### Testing New Repository Processing
1. Use existing project or create new one in dashboard
2. Navigate to "Ask a question" section
3. Use "PGVector RAG (New)" tab for latest implementation
4. Click "Index Repository" to process GitHub repo
5. Test queries after indexing completes

### Debugging AI Integration
1. Check environment variables with `npm run verify:implementation`
2. Test direct API connection with `npm run test:ai`
3. Monitor server logs for API errors and fallback usage
4. Use `npm run utility:check-summaries` to verify AI processing

### Database Inspection
1. Open Prisma Studio: `npm run db:studio`
2. Check embedding counts: `npm run utility:view-db`
3. Verify document processing in pgvector tables
4. Monitor query performance and similarity scores
