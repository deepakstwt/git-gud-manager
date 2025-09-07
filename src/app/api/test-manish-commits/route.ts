import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  try {
    // Find the manish project
    const manishProject = await db.project.findFirst({
      where: { name: 'manish' }
    });
    
    if (!manishProject) {
      return NextResponse.json({ error: 'Manish project not found' }, { status: 404 });
    }
    
    // Get commits for the manish project
    const commits = await db.comment.findMany({
      where: { projectId: manishProject.id },
      orderBy: { commitDate: 'desc' },
      take: 15,
    });
    
    return NextResponse.json({
      project: manishProject,
      totalCommits: commits.length,
      commitsWithSummaries: commits.filter(c => c.summary).length,
      commits: commits.map(commit => ({
        hash: commit.commitHash.substring(0, 7),
        message: commit.commitMessage.substring(0, 50) + '...',
        hasSummary: !!commit.summary,
        summary: commit.summary ? commit.summary.substring(0, 100) + '...' : null,
        date: commit.commitDate
      }))
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
