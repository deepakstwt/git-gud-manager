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
   * Query the PGVector RAG system
   */
  queryPGVector: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      question: z.string().min(1),
      topK: z.number().min(1).max(20).default(5),
    }))
    .mutation(async ({ input }) => {
      return await queryRAGSystem(input.projectId, input.question, input.topK);
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
