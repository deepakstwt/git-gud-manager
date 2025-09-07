import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { processRepositoryForRAG, queryRAG, getRAGStats, clearRAGData } from "@/lib/rag-pipeline";
import { indexGithubRepo, queryRAGSystem } from "@/lib/github-rag-indexer";

export const ragRouter = createTRPCRouter({
  /**
   * Process a GitHub repository through the RAG pipeline
   */
  processRepository: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      githubUrl: z.string().url(),
      githubToken: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await processRepositoryForRAG(
        input.projectId,
        input.githubUrl,
        input.githubToken
      );
    }),

  /**
   * Query the RAG system with a natural language question
   */
  query: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      question: z.string().min(1),
      topK: z.number().min(1).max(20).default(5),
    }))
    .mutation(async ({ input }) => {
      return await queryRAG(input.projectId, input.question, input.topK);
    }),

  /**
   * Get RAG statistics for a project
   */
  getStats: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ input }) => {
      return await getRAGStats(input.projectId);
    }),

  /**
   * Clear all RAG data for a project
   */
  clearData: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await clearRAGData(input.projectId);
    }),

  /**
   * Get all documents for a project (for debugging/admin)
   */
  getDocuments: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const documents = await ctx.db.document.findMany({
        where: { projectId: input.projectId },
        select: {
          id: true,
          fileName: true,
          filePath: true,
          summary: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fileName: 'asc' },
        take: input.limit,
        skip: input.offset,
      });

      const total = await ctx.db.document.count({
        where: { projectId: input.projectId },
      });

      return {
        documents,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  /**
   * Index a GitHub repository with PGVector embeddings
   */
  indexGithubRepository: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      githubUrl: z.string().url(),
      githubToken: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await indexGithubRepo(
        input.projectId,
        input.githubUrl,
        input.githubToken
      );
    }),

  /**
   * Query the PGVector RAG system and persist Q&A
   */
  queryPGVector: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      question: z.string().min(1),
      topK: z.number().min(1).max(20).default(5),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await queryRAGSystem(input.projectId, input.question, input.topK);
      
      // Persist the Q&A in database
      try {
        await ctx.db.question.create({
          data: {
            projectId: input.projectId,
            text: input.question,
            answer: result.answer,
            fileReferences: result.sources.map(source => ({
              fileName: source.fileName,
              summary: source.summary,
              sourceCode: source.sourceCode || '', // Include source code if available
              similarity: source.similarity,
            })),
          },
        });
      } catch (error) {
        console.error('Failed to persist Q&A:', error);
        // Continue even if persistence fails
      }
      
      return result;
    }),

  /**
   * Get Q&A history for a project
   */
  getQuestionHistory: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      limit: z.number().min(1).max(50).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
      const questions = await ctx.db.question.findMany({
        where: { projectId: input.projectId },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
        skip: input.offset,
        select: {
          id: true,
          text: true,
          answer: true,
          fileReferences: true,
          createdAt: true,
        },
      });

      const total = await ctx.db.question.count({
        where: { projectId: input.projectId },
      });

      return {
        questions,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  /**
   * Delete a specific question from history
   */
  deleteQuestion: protectedProcedure
    .input(z.object({
      questionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db.question.delete({
        where: { id: input.questionId },
      });
      return { success: true };
    }),

  /**
   * Clear all Q&A history for a project
   */
  clearQuestionHistory: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.question.deleteMany({
        where: { projectId: input.projectId },
      });
      return { deletedCount: result.count };
    }),

  /**
   * Get PGVector embeddings statistics
   */
  getPGVectorStats: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const totalEmbeddings = await ctx.db.sourceCodeEmbedding.count({
        where: { projectId: input.projectId },
      });

      const embeddingsWithVectors = await ctx.db.$queryRaw<Array<{ count: number }>>`
        SELECT COUNT(*) as count
        FROM "SourceCodeEmbedding"
        WHERE "projectId" = ${input.projectId}
          AND embedding IS NOT NULL;
      `;

      const sampleFiles = await ctx.db.sourceCodeEmbedding.findMany({
        where: { projectId: input.projectId },
        select: {
          fileName: true,
          summary: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      return {
        totalFiles: totalEmbeddings,
        filesWithEmbeddings: embeddingsWithVectors[0]?.count || 0,
        recentFiles: sampleFiles,
      };
    }),

  /**
   * Clear PGVector embeddings for a project
   */
  clearPGVectorData: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await ctx.db.sourceCodeEmbedding.deleteMany({
        where: { projectId: input.projectId },
      });

      return {
        deletedCount: result.count,
        success: true,
      };
    }),
});
