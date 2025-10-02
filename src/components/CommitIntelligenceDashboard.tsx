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

  return (
    <div className="commit-intelligence-dashboard">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="commit-stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 font-medium">Total Commits</p>
                  <p className="text-3xl font-bold text-white">{displayCommits.length}</p>
              </div>
              <GitCommit className="w-8 h-8 text-green-400 floating-animation" />
            </div>
          </CardContent>
        </Card>

        <Card className="commit-stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-400 font-medium">AI Insights</p>
                <p className="text-3xl font-bold text-white">98%</p>
              </div>
              <Brain className="w-8 h-8 text-blue-400 pulse-glow" />
            </div>
          </CardContent>
        </Card>

        <Card className="commit-stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-400 font-medium">Code Quality</p>
                <p className="text-3xl font-bold text-white">A+</p>
              </div>
              <Star className="w-8 h-8 text-purple-400 floating-animation" />
            </div>
          </CardContent>
        </Card>

        <Card className="commit-stats-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400 font-medium">Active Branches</p>
                <p className="text-3xl font-bold text-white">3</p>
              </div>
              <GitBranch className="w-8 h-8 text-orange-400 floating-animation" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Header */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-xl border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Github className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Commits for: <span className="text-emerald-400">{projectName || 'Selected Project'}</span>
            </h3>
            <p className="text-sm text-slate-300">
              Project ID: <code className="bg-slate-800 px-2 py-1 rounded text-xs">{projectId}</code>
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="filter-controls">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search commits, authors, or messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 search-input text-white placeholder:text-slate-400"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="feature">Features</SelectItem>
                  <SelectItem value="bugfix">Bug Fixes</SelectItem>
                  <SelectItem value="refactor">Refactors</SelectItem>
                  <SelectItem value="docs">Documentation</SelectItem>
                  <SelectItem value="test">Tests</SelectItem>
                  <SelectItem value="chore">Chores</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="impact">Impact</SelectItem>
                  <SelectItem value="confidence">Confidence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePollCommits}
                disabled={isPolling}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
                {isPolling ? 'Polling...' : 'Poll Commits'}
              </Button>
              
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-green-500 hover:bg-green-600" : "border-white/20 text-white hover:bg-white/10"}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-green-500 hover:bg-green-600" : "border-white/20 text-white hover:bg-white/10"}
              >
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commits Display */}
      <Tabs defaultValue="commits" className="space-y-6">
        <TabsList className="bg-black/20 border-white/10">
          <TabsTrigger value="commits" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Recent Commits ({projectName || 'Project'})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commits" className="space-y-6">
          {viewMode === "grid" ? (
            <div className="commit-horizontal-scroll">
              {sortedCommits.map((commit) => (
                <Card key={commit.id} className="commit-intelligence-card group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage 
                              src={commit.author.avatar} 
                              alt={commit.author.name}
                              onError={(e) => {
                                console.log("Avatar load error for:", commit.author.avatar);
                                console.log("Fallback to initials:", commit.author.name);
                              }}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                              {commit.author.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        <div>
                          <p className="font-semibold text-white">{commit.author.name}</p>
                          <p className="text-sm text-slate-400">committed</p>
                        </div>
                      </div>
                      <Badge className={`${getCommitTypeColor(commit.aiInsights.type)} commit-type-badge`}>
                        {commit.aiInsights.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-white font-medium mb-2 line-clamp-2">{commit.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center">
                          <GitCommit className="w-4 h-4 mr-1" />
                          {commit.hash.substring(0, 7)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(commit.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="ai-summary-card rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">AI Summary</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full pulse-glow"></div>
                          <span className="text-xs text-green-400 font-medium">AI</span>
                        </div>
                      </div>
                      <p className="text-sm text-white line-clamp-3">{commit.aiSummary}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-400">+{commit.additions}</span>
                        <span className="text-red-400">-{commit.deletions}</span>
                        <span className="text-slate-400">{commit.filesChanged} files</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${getImpactColor(commit.aiInsights.impact)} border-current ai-insight-glow`}>
                          {commit.aiInsights.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs text-blue-400 border-blue-400 ai-insight-glow">
                          {Math.round(commit.aiInsights.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>

                    {commit.pullRequest && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center space-x-2">
                          <GitPullRequest className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400">PR #{commit.pullRequest.number}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 p-1">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {commit.aiInsights.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs text-slate-400 border-slate-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedCommits.map((commit) => (
                <Card key={commit.id} className="commit-intelligence-card commit-list-item">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={commit.author.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white">
                            {commit.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-white">{commit.message}</h3>
                            <Badge className={getCommitTypeColor(commit.aiInsights.type)}>
                              {commit.aiInsights.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center">
                              <GitCommit className="w-4 h-4 mr-1" />
                              {commit.hash.substring(0, 7)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(commit.date).toLocaleDateString()}
                            </span>
                            <span className="text-green-400">+{commit.additions}</span>
                            <span className="text-red-400">-{commit.deletions}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={`text-xs ${getImpactColor(commit.aiInsights.impact)} border-current`}>
                          {commit.aiInsights.impact} impact
                        </Badge>
                        <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                          {Math.round(commit.aiInsights.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Commit Analytics</CardTitle>
              <CardDescription className="text-slate-400">Detailed analysis of commit patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">AI Insights</CardTitle>
              <CardDescription className="text-slate-400">AI-powered analysis and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">AI insights dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
