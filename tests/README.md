# Testing Directory

This directory contains all test files and utilities for the Git Gud Manager project.

## Directory Structure

```
tests/
├── integration/          # Integration tests
├── unit/                 # Unit tests for individual components
├── utilities/            # Database and system utilities
├── verification/         # System verification scripts
└── README.md            # This file
```

## Integration Tests (`integration/`)

- `monitor-rag-testing.mjs` - Monitors RAG (Retrieval-Augmented Generation) system testing

## Unit Tests (`unit/`)

### AI & Gemini Tests
- `test-ai-direct.mjs` - Direct AI functionality testing
- `test-ai-fixed.mjs` - Fixed AI implementation tests
- `test-ai-integration.cjs` - AI integration tests
- `test-ai-standalone.mjs` - Standalone AI tests
- `test-ai-via-api.js` - API-based AI tests
- `test-gemini-direct.mjs` - Direct Gemini API tests
- `test-gemini.mjs` - Gemini integration tests

### Database Tests
- `test-database.js` - Database integration tests
- `test-db-connection.mjs` - Database connection tests
- `test-embeddings.mjs` - Vector embeddings tests

### GitHub Integration Tests
- `test-github.js` - GitHub API tests
- `test-github-loader.mjs` - GitHub repository loader tests
- `test-github-loader.cjs` - CommonJS GitHub loader tests
- `test-github-loader-simple.mjs` - Simplified GitHub loader tests
- `test-github-rag-indexer.mjs` - GitHub RAG indexing tests
- `test-api-commits.mjs` - Commit API tests
- `test-commit-summarization.mjs` - Commit summarization tests

### Polling & Monitoring Tests
- `test-polling.js` - Polling system tests
- `test-polling-detailed.js` - Detailed polling tests

### RAG System Tests
- `test-rag-pipeline.mjs` - RAG pipeline tests
- `test-rag-github-loader.mjs` - RAG GitHub integration tests
- `test-simple-indexing.mjs` - Simple indexing tests

### tRPC Tests
- `test-trpc.mjs` - tRPC functionality tests
- `test-trpc-endpoint.mjs` - tRPC endpoint tests

### Simple Tests
- `test-simple.js` - Basic functionality tests
- `test-simple.cjs` - CommonJS simple tests

## Utilities (`utilities/`)

### Database Utilities
- `view-database.mjs` - View database contents and statistics
- `clear-ai-summaries.mjs` - Clear all AI summaries from database
- `delete-projects-commits.mjs` - Delete projects and commits
- `get-manish-id.mjs` - Get specific user/project IDs

### Checking Utilities
- `check-ai-summaries.mjs` - Check AI summary status
- `check-embeddings.mjs` - Check vector embeddings
- `check-manish-project.mjs` - Check specific project status

## Verification (`verification/`)

- `verify-implementation.mjs` - Verify system implementation
- `verify-pgvector-setup.mjs` - Verify PostgreSQL vector extension setup
- `verify-github-loader.sh` - Verify GitHub loader functionality
- `final-verification.mjs` - Complete system verification

## Running Tests

### Individual Tests
```bash
# Run specific test
node tests/unit/test-ai-direct.mjs
node tests/utilities/check-ai-summaries.mjs
```

### Using NPM Scripts
```bash
# Run main test
npm run test

# Run specific test categories
npm run test:ai
npm run test:database
npm run test:all

# Run utilities
npm run utility:check-summaries
npm run utility:view-db
npm run utility:clear-summaries

# Run verification
npm run verify:implementation
```

## Test Environment

- All tests use the same environment variables as the main application
- Tests are configured to work with the PostgreSQL database with pgvector extension
- Clerk authentication is mocked or bypassed in test scenarios
- Gemini AI integration is tested with fallback patterns when API is unavailable

## Adding New Tests

1. Place unit tests in `tests/unit/`
2. Place integration tests in `tests/integration/`
3. Place utilities in `tests/utilities/`
4. Place verification scripts in `tests/verification/`
5. Update this README when adding new test categories
6. Add npm scripts in `package.json` for commonly used tests

## Import Paths

All test files use relative imports from the tests directory:
```javascript
// Correct import path from tests/unit/ or tests/utilities/
import { someFunction } from '../../src/lib/someModule.js';
```

## Notes

- Tests that require database access will connect to the development database
- Make sure the development server is running for API tests
- Some tests may require specific environment variables to be set
- Vector embedding tests require the pgvector extension to be properly configured
