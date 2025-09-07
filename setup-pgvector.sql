-- Enable PGVector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify the extension is installed
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Check if our table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'SourceCodeEmbedding';
