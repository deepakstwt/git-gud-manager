import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  test: publicProcedure
    .query(() => {
      return { message: "tRPC is working!" };
    }),
    
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string().optional(),
        githubToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First, ensure the user exists in the database
      // Get user email from Clerk (we need to import clerkClient)
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(ctx.userId);
      
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress;
      if (!userEmail) {
        throw new Error("User email not found");
      }

      // Upsert user to ensure they exist in database
      await ctx.db.user.upsert({
        where: { emailAddress: userEmail },
        update: {
          imageUrl: clerkUser.imageUrl,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
        create: {
          id: ctx.userId,
          emailAddress: userEmail,
          imageUrl: clerkUser.imageUrl,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
        },
      });

      // Then create the project
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          ...(input.githubUrl ? { githubUrl: input.githubUrl } : {}),
          UserToProjects: {
            create: {
              userId: ctx.userId,
            },
          },
        },
      });

      // If a GitHub URL is provided, automatically poll commits
      if (input.githubUrl) {
        try {
          console.log(`🔄 Auto-polling commits for new project: ${project.name}`);
          const { pollCommits } = await import("@/lib/github");
          const pollResult = await pollCommits(project.id);
          console.log(`✅ Auto-polled ${pollResult.processed} commits for project ${project.name}`);
        } catch (pollError) {
          console.warn(`⚠️ Failed to auto-poll commits for project ${project.name}:`, pollError);
          // Don't fail project creation if polling fails
        }
      }

      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        UserToProjects: {
          some: {
            userId: ctx.userId,
          },
        },
        deletedAt: null,
      },
    });
  }),
    
  updateProject: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        githubUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Update the project
      const updatedProject = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.githubUrl !== undefined ? { githubUrl: input.githubUrl } : {}),
        },
      });

      return updatedProject;
  }),

  fetchCommitsFromGithub: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      if (!project.githubUrl) {
        throw new Error("Project does not have a GitHub URL");
      }

      // Import the GitHub function and environment
      const { getCommitHashes } = await import("@/lib/github");
      const { env } = await import("@/env");
      
      try {
        const commits = await getCommitHashes(project.githubUrl, env.GITHUB_TOKEN);
        
        // Convert to the format expected by the UI
        return commits.map(commit => ({
          sha: commit.commitHash,
          commit: {
            message: commit.commitMessage,
            author: {
              name: commit.commitAuthorName || 'Unknown',
              date: commit.commitDate?.toISOString() || new Date().toISOString()
            }
          },
          author: {
            login: commit.commitAuthorName || 'unknown',
            avatar_url: commit.commitAuthorAvatar || ''
          }
        }));
      } catch (error: any) {
        console.error("Failed to fetch commits from GitHub:", error);
        throw new Error(`Failed to fetch commits: ${error.message}`);
      }
    }),

  syncCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      if (!project.githubUrl) {
        throw new Error("Project does not have a GitHub URL");
      }

      // Import the database functions and environment
      const { syncProjectCommits } = await import("@/lib/database");
      const { env } = await import("@/env");
      
      try {
        const commits = await syncProjectCommits(project.id, project.githubUrl, env.GITHUB_TOKEN);
        return { success: true, count: commits.length };
      } catch (error) {
        console.error("Failed to sync commits:", error);
        throw new Error("Failed to sync commits from GitHub");
      }
    }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Get commits from database
      return await ctx.db.comment.findMany({
        where: { projectId: input.projectId },
        orderBy: { commitDate: 'desc' },
        take: 15,
      });
    }),
    
  pollCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
        },
      });

      if (!project) {
        throw new Error("Project not found or access denied");
      }

      // Import the polling function
      const { pollCommits } = await import("@/lib/github");
      
      try {
        const result = await pollCommits(project.id);
        return result;
      } catch (error: any) {
        console.error("Failed to poll commits:", error);
        throw new Error(`Failed to poll commits: ${error.message}`);
      }
    }),

  pollAllProjectCommits: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Get all projects for the user
      const projects = await ctx.db.project.findMany({
        where: {
          UserToProjects: {
            some: {
              userId: ctx.userId,
            },
          },
          deletedAt: null,
          githubUrl: { not: null }, // Only projects with GitHub URLs
        },
        select: { id: true, name: true, githubUrl: true },
      });

      if (projects.length === 0) {
        return { results: [], totalProcessed: 0 };
      }

      // Import the polling function
      const { pollCommitsForProjects } = await import("@/lib/github");
      
      try {
        const projectIds = projects.map(p => p.id);
        const result = await pollCommitsForProjects(projectIds);
        return result;
      } catch (error: any) {
        console.error("Failed to poll commits for all projects:", error);
        throw new Error(`Failed to poll commits: ${error.message}`);
      }
    }),
});