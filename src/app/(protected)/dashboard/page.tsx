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
import CommitIntelligenceDashboard from "@/components/CommitIntelligenceDashboard";
import { AICodeAssistantCard } from "@/components/AICodeAssistantCard";
import { 
  RefreshCcw, 
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
  Clock,
  Bot,
  Zap,
  BarChart3
} from "lucide-react";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { ArchiveProjectModal } from "@/components/ArchiveProjectModal";
import { ExportDataModal } from "@/components/ExportDataModal";
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

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
      <Card className="bg-background/60 backdrop-blur border-border/40 shadow-lg transition-all duration-200">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-3 text-lg font-medium">
            <Github className="w-5 h-5 text-primary/80" />
            <span>Commit Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 border border-dashed border-border/60 rounded-lg bg-muted/30">
            <div className="p-3 rounded-full bg-primary/10">
              <Github className="w-6 h-6 text-primary/80" />
            </div>
            <p className="text-sm text-muted-foreground">
              No GitHub repository linked to this project and no commits found in database.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="mt-2 font-medium"
            >
              <Github className="w-4 h-4 mr-2" />
              Add GitHub URL
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/80 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden">
      <CardHeader className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent opacity-60" />
        <div className="flex items-center justify-between relative z-10">
          <CardTitle className="flex items-center gap-3 text-emerald-100">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <Github className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Recent Commits
            </span>
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
              <div key={commit.sha} className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200 border border-border">
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
                    <div className="mt-4 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-400 to-green-600 rounded-full"></div>
                      <div className="ml-3 p-4 bg-green-950/20 border-2 border-green-600 shadow-sm rounded-lg text-sm transition-all duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-900/30">
                            <div className="w-2.5 h-2.5 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="text-green-100 font-semibold tracking-tight">AI Summary</span>
                        </div>
                        <p className="text-green-100 font-medium leading-relaxed pl-7">{commit.summary}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                      <div className="ml-3 p-4 bg-blue-950/20 border-2 border-blue-600 shadow-sm rounded-lg text-sm transition-all duration-200">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-900/30">
                            <div className="w-2.5 h-2.5 bg-blue-400 rounded-full"></div>
                          </div>
                          <span className="text-blue-100 font-semibold tracking-tight">AI Summary</span>
                        </div>
                        <p className="text-blue-100 font-medium leading-relaxed pl-7">
                          No AI summary available. Use &quot;Poll Commits&quot; to generate summaries for this commit.
                        </p>
                      </div>
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
  const [meetingFile, setMeetingFile] = useState<File | null>(null);
  
  // Modal states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Add background gradient wrapper class to body
  useEffect(() => {
    document.body.classList.add('bg-gradient-to-br', 'from-slate-950', 'via-indigo-950', 'to-slate-950', 'min-h-screen');
    return () => {
      document.body.classList.remove('bg-gradient-to-br', 'from-slate-950', 'via-indigo-950', 'to-slate-950', 'min-h-screen');
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRefresh = async () => {
    await refetchProjects();
  };

const handleQuestionSaved = () => {
  // Refetch projects after a question is saved
  refetchProjects();
};  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMeetingFile(file);
      // TODO: Implement file upload logic
      console.log('Uploading file:', file.name);
    }
  };

  const inviteTeamMember = () => {
    setIsInviteModalOpen(true);
  };

  const archiveProject = () => {
    setIsArchiveModalOpen(true);
  };

  const exportData = () => {
    setIsExportModalOpen(true);
  };

  const addTeamMemberMutation = api.project.addTeamMember.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        toast.success("New team member created and added successfully!");
      } else {
        toast.success("Team member added successfully!");
      }
      refetchTeamMembers();
      setIsInviteModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add team member");
    },
  });

  const handleInviteMember = (data: any) => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }
    
    addTeamMemberMutation.mutate({
      projectId,
      email: data.email,
      name: data.name,
      role: data.role,
    });
  };

  const handleArchiveProject = (reason: string) => {
    console.log('Archiving project with reason:', reason);
    // TODO: Implement actual API call
  };

  const exportDataMutation = api.project.exportProjectData.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsExportModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start export");
    },
  });

  const handleExportData = (options: any) => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }
    
    exportDataMutation.mutate({
      projectId,
      format: options.format,
      dateRange: options.dateRange,
      includeData: options.includeData,
    });
  };

  // Fetch real team members from database
  const { data: teamMembers = [], isLoading: teamMembersLoading, refetch: refetchTeamMembers } = api.project.getTeamMembers.useQuery(
    { projectId: projectId || '' },
    { enabled: !!projectId }
  );

  // Debug logging
  console.log("Dashboard state:", {
    isMounted,
    projects: projects?.length || 0,
    project: project?.name || "none",
    projectId,
    user: user ? "authenticated" : "not authenticated"
  });

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
    <>
    <div className="relative w-full min-h-screen main-dashboard-container px-4 md:px-6 lg:px-8">
      {/* Flyhyer-Inspired Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute top-0 left-0 w-full h-full opacity-40">
          <div className="absolute top-1/6 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent rounded-full blur-3xl floating" />
          <div className="absolute bottom-1/4 left-1/6 w-80 h-80 bg-gradient-to-br from-secondary/6 via-secondary/3 to-transparent rounded-full blur-3xl floating-delayed" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-accent/5 via-accent/2 to-transparent rounded-full blur-3xl floating" />
        </div>
        
        {/* Sophisticated Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="relative space-y-12 w-full">
        {/* Flyhyer-Style Hero Section */}
        <div className="hero-section bg-black rounded-3xl p-8 md:p-12 border border-white/10">
          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-black border border-white/10 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary p-2 flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-sm opacity-90" />
              </div>
              <span className="text-sm font-medium text-white uppercase tracking-wider">
                Project Dashboard
              </span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  {project.name}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
                Experience next-generation project management with AI-powered insights, 
                intelligent code analysis, and seamless team collaboration.
              </p>
              
              {/* Metrics Bar */}
              <div className="flex flex-wrap justify-center gap-8 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {teamMembersLoading ? '...' : teamMembers.length}
                  </div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-1">AI</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Powered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-1">24/7</div>
                  <div className="text-sm text-gray-400 uppercase tracking-wider">Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Repository Connected - Match Project Dashboard Background */}
        {project.githubUrl && (
          <div className="relative w-full rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, hsl(222 25% 6%) 0%, hsl(222 20% 4%) 25%, hsl(222 25% 6%) 50%, hsl(222 20% 4%) 75%, hsl(222 25% 6%) 100%)',
            boxShadow: `
              inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(255, 255, 255, 0.05),
              0 20px 40px rgba(0, 0, 0, 0.3),
              0 8px 16px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.08)
            `,
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Soft Inner Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/3 pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10 p-12">
              <div className="flex items-center gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/30 shadow-lg">
                    <Github className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-3">Repository Connected</h3>
                    <a 
                      href={project.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 text-slate-300 hover:text-white transition-colors duration-300 group"
                    >
                      <span className="font-mono text-xl">{project.githubUrl.replace('https://github.com/', '')}</span>
                      <ExternalLink className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 shadow-lg">
                      <span className="text-emerald-300 font-medium text-base">Live Sync Active</span>
                    </div>
                    <div className="px-6 py-3 rounded-full bg-blue-500/20 border border-blue-500/30 shadow-lg">
                      <span className="text-blue-300 font-medium text-base">AI Enhanced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Collaboration Section - Redesigned */}
        <div className="w-full mb-12">
          <div className="luxury-card w-full">
            <div className="p-8">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center border border-blue-400/30 shadow-lg">
                        <Users className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-slate-900 animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        Team Collaboration
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-sm font-medium text-green-400">Active Team</span>
                        <div className="w-1 h-1 rounded-full bg-slate-500 mx-2"></div>
                        <span className="text-sm text-slate-400">{teamMembers.length} members</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-w-2xl">
                    <p className="text-lg font-medium text-slate-200">
                      Build, collaborate, and innovate together
                    </p>
                    <p className="text-slate-400 leading-relaxed">
                      Invite talented developers, designers, and contributors to join your project journey. 
                      Work seamlessly with your team to create amazing things.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center lg:items-start lg:pt-2">
                  <Button 
                    onClick={inviteTeamMember}
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 border-0 text-white shadow-xl hover:shadow-2xl rounded-2xl h-14 px-8 transition-all duration-300 transform hover:scale-105 min-w-[180px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-semibold text-base">Invite Member</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 rounded-2xl h-14 px-6 transition-all duration-200 min-w-[140px]"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
                
              {/* Team Members Section */}
              <div className="space-y-6">
                {teamMembersLoading ? (
                  // Loading state for team members
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="relative group">
                        <div className="backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 animate-pulse min-w-[320px]" style={{
                          background: 'linear-gradient(135deg, hsl(222 25% 6%) 0%, hsl(222 20% 4%) 25%, hsl(222 25% 6%) 50%, hsl(222 20% 4%) 75%, hsl(222 25% 6%) 100%)'
                        }}>
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-700/50"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                              <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : teamMembers.length === 0 ? (
                  // Empty state
                  <div className="text-center py-16">
                    <div className="relative mx-auto w-24 h-24 mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl"></div>
                      <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 flex items-center justify-center border border-blue-400/30">
                        <Users className="w-12 h-12 text-blue-400" />
                      </div>
                    </div>
                    <div className="space-y-6 max-w-md mx-auto">
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3">
                          Build Your Dream Team
                        </h3>
                        <p className="text-slate-400 leading-relaxed">
                          Every great project starts with great people. Invite talented developers, designers, and contributors to join your journey.
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-slate-300">Collaborate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-slate-300">Innovate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-slate-300">Create</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={inviteTeamMember}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 border-0 text-white mt-8 h-14 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-semibold text-base">Invite First Member</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {teamMembers.map((member, index) => (
                      <div key={member.id} className="group relative">
                        <div className="relative backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 min-w-[320px]" style={{
                          background: 'linear-gradient(135deg, hsl(222 25% 6%) 0%, hsl(222 20% 4%) 25%, hsl(222 25% 6%) 50%, hsl(222 20% 4%) 75%, hsl(222 25% 6%) 100%)'
                        }}>
                          {/* Status indicator */}
                          <div className="absolute top-4 right-4">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Avatar className="w-12 h-12 rounded-xl border-2 border-slate-600/50">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                                  {member.initials}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                                {member.name}
                              </h4>
                              <p className="text-sm text-slate-400 truncate">
                                Team Member
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                  <span className="text-xs text-green-400 font-medium">Active</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                                <span className="text-xs text-slate-500">Contributor</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Member Card */}
                    <div className="group relative">
                      <div className="relative backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 cursor-pointer min-w-[320px]" style={{
                        background: 'linear-gradient(135deg, hsl(222 25% 6%) 0%, hsl(222 20% 4%) 25%, hsl(222 25% 6%) 50%, hsl(222 20% 4%) 75%, hsl(222 25% 6%) 100%)'
                      }}>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-400/30 group-hover:scale-110 transition-transform duration-200">
                              <UserPlus className="w-6 h-6 text-blue-400" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
                              Add Member
                            </h4>
                            <p className="text-sm text-slate-400 truncate">
                              Invite to team
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-xs text-blue-400 font-medium">Ready</span>
                              </div>
                              <div className="w-1 h-1 rounded-full bg-slate-500"></div>
                              <span className="text-xs text-slate-500">Invite</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
                </div>
              </div>
            </div>

        {/* Project Actions Section - Second Row */}
        <div className="w-full mb-12">
          <div className="project-actions-row">
            {/* Archive Project Card */}
            <div className="luxury-card project-action-card group">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-destructive/20 to-orange-500/20 flex items-center justify-center border-2 border-destructive/30 group-hover:from-destructive/30 group-hover:to-orange-500/30 transition-all duration-300">
                    <Archive className="w-10 h-10 text-destructive group-hover:scale-110 transition-transform duration-300" />
          </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground text-lg">Archive Project</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Archive this project to preserve data while removing from active projects
                    </p>
          <Button 
            variant="outline" 
                      onClick={archiveProject}
                      className="w-full h-12 magnetic-button border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive Project
          </Button>
                  </div>
                </div>
        </div>
        
            {/* Export Data Card */}
            <div className="luxury-card project-action-card group">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border-2 border-blue-500/30 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-all duration-300">
                    <FileText className="w-10 h-10 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-foreground text-lg">Export Data</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Export project data and analytics for external reporting
                    </p>
        <Button 
          variant="outline" 
                      onClick={exportData}
                      className="w-full h-12 magnetic-button border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export Data
        </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flyhyer-Style Feature Showcase */}
        <div className="w-full space-y-8 mt-12">
          {/* AI Assistant - Full Width Hero */}
          <div className="luxury-card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-primary uppercase tracking-wider">AI Powered</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Intelligent
              </span>
                    <br />
                    <span className="text-foreground">Code Assistant</span>
                  </h2>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Ask questions about your codebase using advanced AI. 
                    Get instant answers with precise context and documentation.
                  </p>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-400/30 glow-pulse">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">∞</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">Unlimited</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Questions</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center border border-green-400/30 glow-pulse">
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">24/7</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">Always</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Available</div>
                  </div>
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-400/30 glow-pulse">
                      <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">AI</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground mb-1">Powered</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Intelligence</div>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <div className="luxury-card rounded-3xl p-8 border-0 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group-hover:scale-[1.02]">
                  <AICodeAssistantCard />
                </div>
                {/* Enhanced floating accent elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl opacity-60 floating glow-pulse" />
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl opacity-40 floating-delayed glow-pulse" />
                <div className="absolute top-1/2 -right-2 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full opacity-30 floating-slow" />
                <div className="absolute -top-2 left-1/2 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-50 floating-slow-delayed" />
              </div>
            </div>
          </div>

          {/* Meeting Intelligence - Full Width */}
          <div className="w-full mt-12">
            <div className="luxury-card group">
              <div className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-3xl" />
                
                <div className="relative space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/30">
                      <Video className="w-10 h-10 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-foreground mb-2">Meeting Intelligence</h3>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Transform your meetings into actionable insights with AI-powered analysis
                      </p>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-accent/30 rounded-3xl p-12 text-center bg-accent/5 transition-all duration-300 group">
                    <div className="space-y-6">
                      <div className="relative inline-block">
                        <Upload className="w-16 h-16 text-accent/70 transition-all duration-300" />
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-xl font-bold text-foreground">Upload Meeting Recording</h4>
                        <p className="text-muted-foreground max-w-lg mx-auto">
                          Drag & drop your audio or video files for comprehensive AI analysis, 
                          transcription, and intelligent insights extraction
                        </p>
                        
                        <input
                          type="file"
                          accept="audio/*,video/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="meeting-upload"
                        />
                        
                        <label htmlFor="meeting-upload">
                          <Button className="magnetic-button bg-gradient-to-r from-accent to-accent/80 border-0 text-white shadow-lg px-8 py-3 text-lg">
                            <Upload className="w-5 h-5 mr-3" />
                            Choose Meeting File
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>

                  {meetingFile && (
                    <div className="luxury-card rounded-2xl p-6 border-0 bg-emerald-500/10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-emerald-100 text-lg">{meetingFile.name}</h4>
                          <p className="text-emerald-400 mt-1">Ready for AI processing and analysis</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse" />
                          <span className="text-emerald-400 font-medium text-sm">Processing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* Advanced Features Section */}
        <div className="w-full space-y-8 mt-12">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Advanced
              </span>
              <span className="text-foreground"> Project Tools</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features to streamline your development workflow
            </p>
          </div>

          <div className="space-y-8">
            {/* Commit Intelligence - Full Width */}
            <div className="luxury-card w-full">
              <div className="p-8">
                {/* Header Section - Same as Team Collaboration */}
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-8">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-400/30 shadow-lg">
                          <Github className="w-7 h-7 text-emerald-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-emerald-100 to-green-100 bg-clip-text text-transparent">
                          Commit Intelligence
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-sm font-medium text-emerald-400">AI Analysis Active</span>
                          <div className="w-1 h-1 rounded-full bg-slate-500 mx-2"></div>
                          <span className="text-sm text-slate-400">Real-time insights</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-w-2xl">
                      <p className="text-lg font-medium text-slate-200">
                        AI-powered commit analysis and insights
                      </p>
                      <p className="text-slate-400 leading-relaxed">
                        Get intelligent analysis of your commits with AI-powered insights, 
                        code quality metrics, and automated summaries to improve your development workflow.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center lg:items-start lg:pt-2">
                    <Button 
                      className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 border-0 text-white shadow-xl hover:shadow-2xl rounded-2xl h-14 px-8 transition-all duration-300 transform hover:scale-105 min-w-[180px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <Github className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-semibold text-base">View Analysis</span>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="border-slate-600/50 text-slate-300 hover:bg-slate-800/50 hover:border-slate-500 rounded-2xl h-14 px-6 transition-all duration-200 min-w-[140px]"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </div>
                </div>
                
                {/* Commit Intelligence Content */}
                <div className="space-y-6">
                  <CommitIntelligenceDashboard projectId={project.id} projectName={project.name} />
                </div>
              </div>
            </div>

            {/* Repository Management - Full Width Below */}
            <div className="luxury-card">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30">
                    <FileText className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Repository Sync</h3>
                    <p className="text-muted-foreground">Advanced repository loading and processing</p>
                  </div>
                </div>

                <div className="luxury-card rounded-2xl p-6 border-0">
                  <RepositoryLoader />
                </div>
              </div>
            </div>
          </div>
      </div>

        {/* RAG Intelligence - Premium Full Width */}
        <div className="w-full mt-12">
          <div className="luxury-card">
            <div className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent" />
              <div className="relative">
        <EnhancedRAGComponent 
          projectId={project.id} 
          projectName={project.name}
        />
      </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />

      <ArchiveProjectModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onArchive={handleArchiveProject}
        projectName={project?.name}
      />

      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportData}
        projectName={project?.name}
      />
    </>
  );
}

export default DashboardPage;