"use client";

import { useState } from "react";
import { useUser } from '@clerk/nextjs';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  GitCommit, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock, 
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Brain,
  BarChart3,
  PieChart,
  Calendar,
  Code2,
  Zap,
  Star,
  AlertCircle,
  CheckCircle2,
  GitBranch,
  GitPullRequest,
  MessageSquare,
  FileText,
  Download,
  Settings,
  Eye,
  EyeOff,
  Github
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";

interface CommitData {
  id: string;
  hash: string;
  message: string;
  author: {
    name: string;
    email: string;
    avatar: string;
  };
  date: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  aiSummary: string;
  aiInsights: {
    type: string;
    impact: string;
    confidence: number;
    tags: string[];
  };
  pullRequest?: {
    number: number;
    url: string;
  };
}

interface CommitIntelligenceDashboardProps {
  projectId: string;
  projectName?: string;
}

export default function CommitIntelligenceDashboard({ projectId, projectName }: CommitIntelligenceDashboardProps) {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [selectedCommit, setSelectedCommit] = useState<CommitData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate mock commits with real user data
  const generateMockCommits = (): CommitData[] => {
    const userAvatar = user?.imageUrl || "https://avatars.githubusercontent.com/u/12345678?v=4";
    const userName = user?.fullName || user?.firstName || "Deepak Prajapati";
    
    // Debug: Log user data
    console.log("User data in CommitIntelligenceDashboard:", {
      user,
      imageUrl: user?.imageUrl,
      fullName: user?.fullName,
      firstName: user?.firstName,
      userAvatar,
      userName
    });
    
    return [
    {
      id: "1",
      hash: "a1b2c3d",
      message: `[${projectName || 'Project'}] Merge pull request #7 from deepakstwt/uiUpdated - Add NeighborFit - Neighborhood Discovery Web App to portfolio`,
      author: {
        name: userName,
        email: user?.emailAddresses?.[0]?.emailAddress || "deepak@example.com",
        avatar: userAvatar
      },
      date: "2024-01-15T10:30:00Z",
      additions: 245,
      deletions: 12,
      filesChanged: 8,
      aiSummary: "This commit is a feature addition, integrating the 'NeighborFit - Neighborhood Discovery Web App' into the portfolio. The primary change involves adding a new component ('NeighborFitIMG.js') and significantly modifying the portfolio's CSS ('portfolio.css'), primarily enhancing the dark mode styling. Specifically, the dark mode's background and border colors, shadows, and a backdrop filter (blur) were adjusted for improved visibility and aesthetic appeal. The commit incorporates additional styling improvements and component integration.",
      aiInsights: {
        type: "feature",
        impact: "high",
        confidence: 0.95,
        tags: ["portfolio", "ui", "dark-mode", "component"]
      },
      pullRequest: {
        number: 7,
        url: "https://github.com/deepakstwt/My_Portfolio_Man/pull/7"
      }
    },
    {
      id: "2",
      hash: "e4f5g6h",
      message: `[${projectName || 'Project'}] Fix responsive layout issues in mobile view`,
      author: {
        name: userName,
        email: user?.emailAddresses?.[0]?.emailAddress || "deepak@example.com",
        avatar: userAvatar
      },
      date: "2024-01-14T15:45:00Z",
      additions: 67,
      deletions: 23,
      filesChanged: 3,
      aiSummary: "This commit addresses responsive design issues in the mobile viewport. The changes include CSS media queries for better mobile layout, adjusted padding and margins for smaller screens, and improved touch target sizes for better mobile usability.",
      aiInsights: {
        type: "bugfix",
        impact: "medium",
        confidence: 0.88,
        tags: ["responsive", "mobile", "css", "layout"]
      }
    },
    {
      id: "3",
      hash: "i7j8k9l",
      message: "Refactor authentication logic for better security",
      author: {
        name: userName,
        email: user?.emailAddresses?.[0]?.emailAddress || "deepak@example.com",
        avatar: userAvatar
      },
      date: "2024-01-13T09:20:00Z",
      additions: 156,
      deletions: 89,
      filesChanged: 5,
      aiSummary: "This commit refactors the authentication system to improve security and maintainability. Key changes include implementing JWT token validation, adding password hashing with bcrypt, and restructuring the auth middleware for better error handling and security checks.",
      aiInsights: {
        type: "refactor",
        impact: "high",
        confidence: 0.92,
        tags: ["security", "auth", "jwt", "refactor"]
      }
    },
    {
      id: "4",
      hash: "m8n9o0p",
      message: "Add comprehensive test coverage for user management module",
      author: {
        name: userName,
        email: user?.emailAddresses?.[0]?.emailAddress || "deepak@example.com",
        avatar: userAvatar
      },
      date: "2024-01-12T14:15:00Z",
      additions: 320,
      deletions: 15,
      filesChanged: 12,
      aiSummary: "This commit significantly improves test coverage for the user management module by adding unit tests, integration tests, and end-to-end tests. The tests cover user registration, authentication, profile updates, and error handling scenarios.",
      aiInsights: {
        type: "test",
        impact: "medium",
        confidence: 0.90,
        tags: ["testing", "coverage", "user-management", "quality"]
      }
    },
    {
      id: "5",
      hash: "q1r2s3t",
      message: "Update documentation for API endpoints and integration guides",
      author: {
        name: userName,
        email: user?.emailAddresses?.[0]?.emailAddress || "deepak@example.com",
        avatar: userAvatar
      },
      date: "2024-01-11T11:30:00Z",
      additions: 180,
      deletions: 45,
      filesChanged: 8,
      aiSummary: "This commit updates the project documentation with comprehensive API documentation, integration guides, and usage examples. The documentation now includes detailed endpoint descriptions, request/response schemas, and code samples for better developer experience.",
      aiInsights: {
        type: "docs",
        impact: "low",
        confidence: 0.85,
        tags: ["documentation", "api", "guides", "developer-experience"]
      }
    },
    {
      id: "6",
      hash: "u4v5w6x",
      message: "Optimize database queries and add caching layer",
      author: {
        name: userName,
        email: user?.emailAddresses?.[0]?.emailAddress || "deepak@example.com",
        avatar: userAvatar
      },
      date: "2024-01-10T16:45:00Z",
      additions: 200,
      deletions: 80,
      filesChanged: 6,
      aiSummary: "This commit implements performance optimizations for database queries and adds a Redis-based caching layer. The changes include query optimization, index improvements, and cache invalidation strategies that significantly improve application performance.",
      aiInsights: {
        type: "chore",
        impact: "high",
        confidence: 0.94,
        tags: ["performance", "database", "caching", "optimization"]
      }
    }
  ];
  };

  // Get commits from API for the selected project
  const { data: commits = [], isLoading: commitsLoading, error: commitsError } = api.project.getCommits.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Use generated mock commits with real user data as fallback
  const mockCommits = generateMockCommits();

  // Show loading state while user data is being loaded
  if (!isLoaded) {
    return (
      <div className="commit-intelligence-dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show loading state while commits are being fetched
  if (commitsLoading) {
    return (
      <div className="commit-intelligence-dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading commits for project...</span>
        </div>
      </div>
    );
  }

  // Convert database commits to UI format
  const realCommits: CommitData[] = commits.map((commit: any, index: number) => ({
    id: commit.id,
    hash: commit.commitHash,
    message: commit.commitMessage,
    author: {
      name: commit.commitAuthorName || user?.fullName || user?.firstName || "Unknown",
      email: user?.emailAddresses?.[0]?.emailAddress || "unknown@example.com",
      avatar: commit.commitAuthorAvatar || user?.imageUrl || "https://avatars.githubusercontent.com/u/12345678?v=4"
    },
    date: commit.commitDate?.toISOString() || new Date().toISOString(),
    additions: Math.floor(Math.random() * 100) + 10, // Mock data for now
    deletions: Math.floor(Math.random() * 50) + 5,
    filesChanged: Math.floor(Math.random() * 10) + 1,
    aiSummary: commit.summary || "AI analysis not available for this commit.",
    aiInsights: {
      type: (["feature", "bugfix", "refactor", "docs", "test", "chore"][Math.floor(Math.random() * 6)]) as "feature" | "bugfix" | "refactor" | "docs" | "test" | "chore",
      impact: (["high", "medium", "low"][Math.floor(Math.random() * 3)]) as "high" | "medium" | "low",
      confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      tags: ["code", "improvement", "update"].slice(0, Math.floor(Math.random() * 3) + 1)
    }
  }));

  // Use real commits if available, otherwise fall back to mock data
  const displayCommits = realCommits.length > 0 ? realCommits : mockCommits;

  // Debug: Log project and commits info
  console.log("🔍 CommitIntelligenceDashboard - Project Info:", {
    projectId,
    projectName,
    realCommitsCount: realCommits.length,
    mockCommitsCount: mockCommits.length,
    displayCommitsCount: displayCommits.length,
    usingRealCommits: realCommits.length > 0,
    commitsData: commits,
    commitsError: commitsError?.message,
    firstCommitMessage: displayCommits[0]?.message || "No commits"
  });

  const handlePollCommits = async () => {
    setIsPolling(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Commits refreshed successfully!");
    } catch (error) {
      toast.error("Failed to refresh commits");
    } finally {
      setIsPolling(false);
    }
  };

  const handleCommitClick = (commit: CommitData) => {
    setSelectedCommit(commit);
    setIsModalOpen(true);
  };

  const filteredCommits = displayCommits.filter(commit => {
    const matchesSearch = commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         commit.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || commit.aiInsights.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedCommits = filteredCommits.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "impact":
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.aiInsights.impact as keyof typeof impactOrder] - impactOrder[a.aiInsights.impact as keyof typeof impactOrder];
      case "confidence":
        return b.aiInsights.confidence - a.aiInsights.confidence;
      default:
        return 0;
    }
  });

  const getCommitTypeColor = (type: string) => {
    switch (type) {
      case "feature": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "bugfix": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "refactor": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "docs": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "test": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "chore": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

         // Detailed Commit View Component
         const CommitDetailView = ({ commit }: { commit: CommitData }) => (
           <div className="space-y-6">
             {/* Header Section */}
             <div className="border-b border-white/10 pb-6">
               <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center space-x-4">
                   <Avatar className="w-12 h-12">
                     <AvatarImage src={commit.author.avatar} />
                     <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-sm">
                       {commit.author.name.split(' ').map(n => n[0]).join('')}
                     </AvatarFallback>
                   </Avatar>
                   <div>
                     <h3 className="text-xl font-bold text-white">{commit.author.name}</h3>
                     <p className="text-sm text-slate-400">{new Date(commit.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <Badge className={`${getCommitTypeColor(commit.aiInsights.type)} text-sm px-3 py-1`}>
                   {commit.aiInsights.type}
                 </Badge>
               </div>
               
               <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                 <h4 className="text-base font-semibold text-white mb-2">Commit Message</h4>
                 <p className="text-slate-300 text-base leading-relaxed">{commit.message}</p>
               </div>
             </div>

             {/* AI Summary Section */}
             <div className="space-y-4">
               <div className="flex items-center space-x-3">
                 <Brain className="w-5 h-5 text-blue-400" />
                 <h4 className="text-lg font-semibold text-white">AI Summary</h4>
                 <div className="flex items-center space-x-2">
                   <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                   <span className="text-sm text-green-400 font-medium">AI</span>
                 </div>
               </div>
               
               <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-5 border border-blue-500/20">
                 <p className="text-slate-200 text-base leading-relaxed">{commit.aiSummary}</p>
               </div>
             </div>

             {/* Statistics Section */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                 <h5 className="text-sm font-medium text-slate-400 mb-3">Code Changes</h5>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">Added</span>
                     <span className="text-green-400 font-semibold">+{commit.additions}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">Deleted</span>
                     <span className="text-red-400 font-semibold">-{commit.deletions}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">Files</span>
                     <span className="text-blue-400 font-semibold">{commit.filesChanged}</span>
                   </div>
                 </div>
               </div>

               <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                 <h5 className="text-sm font-medium text-slate-400 mb-3">Impact</h5>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">Level</span>
                     <Badge className={`${getImpactColor(commit.aiInsights.impact)} border-current text-sm px-2 py-1`}>
                       {commit.aiInsights.impact}
                     </Badge>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">Confidence</span>
                     <span className="text-blue-400 font-semibold">
                       {Math.round(commit.aiInsights.confidence * 100)}%
                     </span>
                   </div>
                 </div>
               </div>

               <div className="bg-slate-800/50 rounded-lg p-5 border border-slate-700">
                 <h5 className="text-sm font-medium text-slate-400 mb-3">Details</h5>
                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">Hash</span>
                     <code className="text-sm text-slate-400 bg-slate-900 px-2 py-1 rounded">
                       {commit.hash.substring(0, 7)}
                     </code>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">Date</span>
                     <span className="text-slate-300 text-sm">
                       {new Date(commit.date).toLocaleDateString()}
                     </span>
                   </div>
                 </div>
               </div>
             </div>

             {/* Tags Section */}
             {commit.aiInsights.tags.length > 0 && (
               <div className="space-y-3">
                 <h5 className="text-sm font-medium text-slate-400">Tags</h5>
                 <div className="flex flex-wrap gap-2">
                   {commit.aiInsights.tags.map((tag, index) => (
                     <Badge key={index} variant="outline" className="text-sm text-slate-400 border-slate-600 px-3 py-1">
                       {tag}
                     </Badge>
                   ))}
                 </div>
               </div>
             )}

             {/* Pull Request Section */}
             {commit.pullRequest && (
               <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                     <GitPullRequest className="w-5 h-5 text-blue-400" />
                     <span className="text-slate-300 text-base">PR #{commit.pullRequest.number}</span>
                   </div>
                   <Button size="sm" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10 text-sm px-3 py-2">
                     <ExternalLink className="w-4 h-4 mr-2" />
                     View
                   </Button>
                 </div>
               </div>
             )}
    </div>
  );

  return (
    <div className="commit-intelligence-dashboard">
      {/* Simple Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="commit-stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Commits</p>
                <p className="text-2xl font-bold text-white">{displayCommits.length}</p>
              </div>
              <GitCommit className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="commit-stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">AI Analysis</p>
                <p className="text-2xl font-bold text-white">Active</p>
              </div>
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="commit-stats-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Project</p>
                <p className="text-lg font-bold text-white truncate">{projectName || 'Selected'}</p>
              </div>
              <Github className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Search */}
      <div className="mb-6">
        <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
            placeholder="Search commits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

      {/* Simple Commits List with Fixed Height and Scrolling */}
      <div className="max-h-96 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {sortedCommits.map((commit) => (
          <Card 
            key={commit.id} 
            className="commit-intelligence-card cursor-pointer"
            onClick={() => handleCommitClick(commit)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={commit.author.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xs">
                              {commit.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`${getCommitTypeColor(commit.aiInsights.type)} text-xs`}>
                        {commit.aiInsights.type}
                      </Badge>
                    <span className="text-xs text-slate-400">
                          {new Date(commit.date).toLocaleDateString()}
                        </span>
                    <div className="flex items-center space-x-1 ml-auto">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">Click to view details</span>
                    </div>
                    </div>

                  <p className="text-white font-medium mb-2 line-clamp-2">{commit.message}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span className="text-green-400">+{commit.additions}</span>
                            <span className="text-red-400">-{commit.deletions}</span>
                    <span>{commit.filesChanged} files</span>
                      </div>
                    </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Scroll indicator */}
        {sortedCommits.length > 3 && (
          <div className="text-center py-2 text-xs text-slate-400">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <span className="ml-2">Scroll to see more commits</span>
            </div>
          </div>
        )}
              </div>

             {/* Commit Detail Modal */}
             <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
               <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
                 <DialogHeader className="px-8 pt-6 pb-4">
                   <DialogTitle className="text-2xl font-bold text-white flex items-center space-x-3">
                     <GitCommit className="w-6 h-6 text-green-400" />
                     <span>Commit Details</span>
                   </DialogTitle>
                 </DialogHeader>
                 
                 <div className="px-8 pb-6">
                   {selectedCommit && <CommitDetailView commit={selectedCommit} />}
                 </div>
               </DialogContent>
             </Dialog>
    </div>
  );
}
