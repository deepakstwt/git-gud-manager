#!/usr/bin/env node

/**
 * Verify PGVector extension and schema setup
 */

import { db } from '../src/server/db.js';

async function verifyPGVectorSetup() {
  console.log('🔍 Verifying PGVector setup...\n');

  try {
    // Check if PGVector extension is installed
    console.log('1. Checking PGVector extension...');
    const extensions = await db.$queryRaw`
      SELECT * FROM pg_extension WHERE extname = 'vector';
    `;
    
    if (extensions.length > 0) {
      console.log('✅ PGVector extension is installed');
    } else {
      console.log('❌ PGVector extension is NOT installed');
      console.log('   Run: CREATE EXTENSION vector; in your PostgreSQL database');
    }

    // Check if SourceCodeEmbedding table exists
    console.log('\n2. Checking SourceCodeEmbedding table...');
    const table = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name = 'SourceCodeEmbedding';
    `;

    if (table.length > 0) {
      console.log('✅ SourceCodeEmbedding table exists');
    } else {
      console.log('❌ SourceCodeEmbedding table does NOT exist');
      console.log('   Run: npx prisma db push');
    }

    // Check table structure
    console.log('\n3. Checking table structure...');
    const columns = await db.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'SourceCodeEmbedding'
      ORDER BY ordinal_position;
    `;

    console.log('📋 Table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type || col.udt_name}`);
    });

    // Test vector operations
    console.log('\n4. Testing vector operations...');
    try {
      // Create a test vector
      const testVector = Array.from({ length: 768 }, () => Math.random());
      
      // Test vector creation and operations
      await db.$queryRaw`SELECT ${testVector}::vector as test_vector;`;
      console.log('✅ Vector creation works');

      // Test cosine similarity
      const testVector2 = Array.from({ length: 768 }, () => Math.random());
      const similarity = await db.$queryRaw`
        SELECT (${testVector}::vector <=> ${testVector2}::vector) as cosine_distance;
      `;
      console.log(`✅ Cosine similarity works (distance: ${similarity[0].cosine_distance.toFixed(4)})`);

    } catch (vectorError) {
      console.log('❌ Vector operations failed:', vectorError.message);
    }

    console.log('\n🎉 Verification completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await db.$disconnect();
  }
}

verifyPGVectorSetup().catch(console.error);
