'use client';

import { useUser } from '@clerk/nextjs';
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import RepositoryLoader from "@/components/repository-loader";
import { EnhancedRAGComponent } from "@/components/enhanced-rag";
import { 
  RefreshCw, 
  ExternalLink, 
  Calendar, 
  Hash, 
  User, 
  Github, 
  Users, 
  UserPlus, 
  Archive, 
  Upload,
  Send,
  MessageSquare,
  Video,
  FileText,
  Clock
} from "lucide-react";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';

// CommitLog Component
interface CommitLogProps {
  project: any;
}

const CommitLog: React.FC<CommitLogProps> = ({ project }) => {
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl || '');
  const [isPolling, setIsPolling] = useState(false);
  const { refetchProjects } = useRefetch();
  const utils = api.useUtils();
  const updateProject = api.project.updateProject.useMutation({
    onSuccess: () => {
      refetchProjects();
      setIsEditing(false);
    },
  });
  const pollCommits = api.project.pollCommits.useMutation();

  useEffect(() => {
    setGithubUrl(project?.githubUrl || '');
  }, [project]);

  const handleSaveGithubUrl = () => {
    if (project?.id) {
      updateProject.mutate({
        id: project.id,
        githubUrl: githubUrl,
      });
    }
  };

  const fetchCommits = useCallback(async () => {
    if (!project?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First, try to get commits from database (with AI summaries)
      const dbCommits = await utils.project.getCommits.fetch({
        projectId: project.id,
      });
      
      if (dbCommits.length > 0) {
        // Convert database commits to UI format
        const formattedCommits = dbCommits.map(commit => ({
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
          },
          summary: commit.summary // This is the AI-generated summary
        }));
        
        setCommits(formattedCommits);
        setError(null);
        return;
      }
      
      // Fallback: If no commits in database and GitHub URL exists, fetch from GitHub
      if (project?.githubUrl) {
        const formattedCommits = await utils.project.fetchCommitsFromGithub.fetch({
          projectId: project.id,
        });
        
        setCommits(formattedCommits);
        setError(null);
      } else {
        setCommits([]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch commits:', err.message);
      
      // Provide specific error messages based on the error type
      if (err.message.includes('404') || err.message.includes('not found')) {
        setError(`Repository not found. It may be private, renamed, or doesn't exist.`);
      } else if (err.message.includes('403') || err.message.includes('rate limit')) {
        setError('Rate limit exceeded or repository access denied. Please try again later.');
      } else if (err.message.includes('401') || err.message.includes('authentication')) {
        setError('Authentication required to access this repository.');
      } else {
        setError(`Failed to fetch commits: ${err.message}`);
      }
      
      setCommits([]);
    } finally {
      setLoading(false);
    }
  }, [project?.id, project?.githubUrl, utils.project.getCommits, utils.project.fetchCommitsFromGithub]);

  useEffect(() => {
    if (project?.id) {
      fetchCommits();
    }
  }, [project?.id, fetchCommits]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const handlePollCommits = async () => {
    if (!project?.id) return;
    
    setIsPolling(true);
    try {
      const result = await pollCommits.mutateAsync({ projectId: project.id });
      console.log('Polling result:', result);
      
      if (result.processed > 0) {
        // Invalidate and refetch the commits cache
        await utils.project.getCommits.invalidate({ projectId: project.id });
        // Refresh the commits display
        await fetchCommits();
        alert(`✅ Successfully processed ${result.processed} new commits with AI summaries!`);
      } else {
        alert('ℹ️ No new commits found to process.');
      }
    } catch (error: any) {
      console.error('Error polling commits:', error);
      alert(`❌ Failed to poll commits: ${error.message}`);
    } finally {
      setIsPolling(false);
    }
  };

  // Show a prompt to add GitHub URL only if there's no GitHub URL, no commits in database, and not currently loading
  if (!project?.githubUrl && commits.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Commit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No GitHub repository linked to this project and no commits found in database.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Add GitHub URL
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Github className="w-5 h-5" />
            Recent Commits
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePollCommits}
              disabled={isPolling || !project?.githubUrl}
              title={project?.githubUrl ? "Poll for new commits from GitHub" : "Add GitHub URL to poll commits"}
            >
              {isPolling ? 'Polling...' : '🔄 Poll Commits'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit URL'}
            </Button>
          </div>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveGithubUrl}
                disabled={updateProject.isPending}
              >
                {updateProject.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGithubUrl(project?.githubUrl || '');
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {project?.githubUrl 
              ? `Latest commits from ${project.githubUrl.replace('https://github.com/', '')}`
              : `Showing ${commits.length} commits from database`
            }
          </p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="mb-4">
              <Github className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">{error}</p>
              <p className="text-xs text-muted-foreground mb-4">
                Please check if the repository URL is correct and publicly accessible.
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchCommits}
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.open(project?.githubUrl, '_blank')}
              >
                View Repository
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                Edit URL
              </Button>
            </div>
          </div>
        ) : commits.length === 0 ? (
          <div className="text-center py-8">
            <Github className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              No commits found in this repository.
            </p>
            <p className="text-xs text-muted-foreground">
              The repository might be empty or recently created.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {commits.map((commit) => (
              <div key={commit.sha} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={commit.author?.avatar_url} />
                  <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                    {commit.commit.author.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{commit.commit.author.name}</span>
                    <span className="text-xs text-muted-foreground">committed</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-gray-700 mt-1 font-medium">{commit.commit.message}</p>
                  
                  {/* AI Summary - Show real summary if available */}
                  {commit.summary ? (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700 font-medium">AI Summary</span>
                      </div>
                      <p className="text-green-600">{commit.summary}</p>
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-700 font-medium">AI Summary</span>
                      </div>
                      <p className="text-blue-600">
                        No AI summary available. Use &quot;Poll Commits&quot; to generate summaries for this commit.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{formatDate(commit.commit.author.date)}</span>
                    <span className="font-mono text-xs">#{commit.sha.substring(0, 7)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const { user } = useUser();
  const { projects, project, projectId, setProjectId } = useProject();
  const { refetchProjects } = useRefetch();
  const [isMounted, setIsMounted] = useState(false);
  const [question, setQuestion] = useState('');
  const [meetingFile, setMeetingFile] = useState<File | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRefresh = async () => {
    await refetchProjects();
  };

  const handleAskQuestion = () => {
    if (question.trim()) {
      // TODO: Implement question submission logic
      console.log('Asking question:', question);
      setQuestion('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMeetingFile(file);
      // TODO: Implement file upload logic
      console.log('Uploading file:', file.name);
    }
  };

  const inviteTeamMember = () => {
    // TODO: Implement team member invitation
    console.log('Inviting team member...');
  };

  const archiveProject = () => {
    // TODO: Implement project archiving
    console.log('Archiving project...');
  };

  // Mock team members data (replace with real data later)
  const teamMembers = [
    { id: '1', name: 'John Doe', avatar: '', initials: 'JD' },
    { id: '2', name: 'Jane Smith', avatar: '', initials: 'JS' },
    { id: '3', name: 'Mike Johnson', avatar: '', initials: 'MJ' },
  ];

  if (!isMounted) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
              <p className="text-sm mb-4">
                {projects?.length === 0 
                  ? "Create your first project to get started"
                  : "Select a project from the sidebar to view its dashboard"
                }
              </p>
              {projects?.length === 0 && (
                <Link href="/create">
                  <Button>Create Your First Project</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* GitHub Link Banner */}
      {project.githubUrl && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-y-4">
            <div className="w-fit rounded-md bg-primary px-4 py-3">
              <div className="flex items-center">
                <Github size={20} className="text-white" />
                <p className="text-sm font-medium text-white ml-2">This project is linked to</p>
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-white/80 hover:underline ml-2"
                >
                  {project.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="h-4" />
        </>
      )}

      {/* Team Members, Invite, and Archive Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {teamMembers.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={inviteTeamMember}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite a team member!
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={archiveProject}
          className="flex items-center gap-2"
        >
          <Archive className="w-4 h-4" />
          Archive
        </Button>
      </div>

      {/* Question and Meeting Cards Grid */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-5">
        {/* Ask Question Card - 3 columns */}
        <Card className="sm:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Ask a question
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Dionysus has knowledge of the codebase
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleAskQuestion}
              disabled={!question.trim()}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Ask Dionysus!
            </Button>
          </CardContent>
        </Card>

        {/* Upload Meeting Card - 2 columns */}
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Create a new meeting
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Analyse your meeting with Dionysus. Powered by AI.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Drop your meeting file here
                </p>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="meeting-upload"
                />
                <label htmlFor="meeting-upload">
                  <Button variant="outline" size="sm" className="cursor-pointer">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload Meeting
                  </Button>
                </label>
              </div>
            </div>
            {meetingFile && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium">{meetingFile.name}</span>
                </div>
                <p className="text-xs text-green-600 mt-1">Ready to upload</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commit Log Section */}
      <div className="mt-8">
        <CommitLog project={project} />
      </div>

      {/* Repository Loader Section */}
      <div className="mt-8">
        <RepositoryLoader />
      </div>

      {/* RAG Pipeline Section */}
      <div className="mt-8">
        <EnhancedRAGComponent 
          projectId={project.id} 
          projectName={project.name}
        />
      </div>

      {/* Project Details Card (Additional Info) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Project ID</div>
              <code className="block bg-muted px-3 py-2 rounded text-sm font-mono">
                {project.id}
              </code>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Created</div>
              <p className="text-sm">
                {new Date(project.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Team Size</div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">{teamMembers.length} members</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
