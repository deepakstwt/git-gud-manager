"use client";

import { useState, useEffect } from "react";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
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
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

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
  filesChanged: number;
  additions: number;
  deletions: number;
  aiSummary: string;
  aiInsights: {
    type: 'feature' | 'bugfix' | 'refactor' | 'docs' | 'test' | 'chore';
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    tags: string[];
  };
  branch: string;
  pullRequest?: {
    number: number;
    title: string;
    url: string;
  };
}

export default function CommitIntelligencePage() {
  const { project } = useProject();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  // Fetch commits data
  const { data: commits, isLoading, refetch } = api.project.getCommits.useQuery(
    { projectId: project?.id ?? "" },
    { enabled: !!project?.id }
  );

  // Poll commits mutation
  const pollCommitsMutation = api.project.pollCommits.useMutation({
    onSuccess: () => {
      toast.success("Commits refreshed successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to refresh commits: ${error.message}`);
    },
  });

  // Mock data for demonstration - replace with real data
  const mockCommits: CommitData[] = [
    {
      id: "1",
      hash: "a1b2c3d",
      message: "feat: Add advanced commit analysis with AI insights",
      author: {
        name: "Deepak Prajapati",
        email: "deepak@example.com",
        avatar: "https://github.com/deepakstwt.png"
      },
      date: "2024-01-15T10:30:00Z",
      filesChanged: 12,
      additions: 245,
      deletions: 89,
      aiSummary: "This commit introduces a comprehensive commit analysis system with AI-powered insights, including sentiment analysis, code quality metrics, and automated categorization.",
      aiInsights: {
        type: "feature",
        confidence: 0.95,
        impact: "high",
        tags: ["ai", "analytics", "frontend", "backend"]
      },
      branch: "main",
      pullRequest: {
        number: 42,
        title: "Add Commit Intelligence Dashboard",
        url: "https://github.com/deepakstwt/My_Portfolio_Man/pull/42"
      }
    },
    {
      id: "2",
      hash: "e4f5g6h",
      message: "fix: Resolve memory leak in commit processing pipeline",
      author: {
        name: "Deepak Prajapati",
        email: "deepak@example.com",
        avatar: "https://github.com/deepakstwt.png"
      },
      date: "2024-01-14T15:45:00Z",
      filesChanged: 3,
      additions: 15,
      deletions: 8,
      aiSummary: "Critical bug fix addressing memory leak in the commit processing pipeline that was causing performance degradation over time.",
      aiInsights: {
        type: "bugfix",
        confidence: 0.88,
        impact: "high",
        tags: ["bugfix", "performance", "memory", "pipeline"]
      },
      branch: "main"
    },
    {
      id: "3",
      hash: "i7j8k9l",
      message: "refactor: Optimize database queries for better performance",
      author: {
        name: "Deepak Prajapati",
        email: "deepak@example.com",
        avatar: "https://github.com/deepakstwt.png"
      },
      date: "2024-01-13T09:20:00Z",
      filesChanged: 8,
      additions: 120,
      deletions: 45,
      aiSummary: "Database optimization refactor that improves query performance by 40% through better indexing and query structure.",
      aiInsights: {
        type: "refactor",
        confidence: 0.92,
        impact: "medium",
        tags: ["refactor", "database", "performance", "optimization"]
      },
      branch: "feature/optimization"
    }
  ];

  const handlePollCommits = async () => {
    if (!project?.id) return;
    
    setIsPolling(true);
    try {
      await pollCommitsMutation.mutateAsync({ projectId: project.id });
    } finally {
      setIsPolling(false);
    }
  };

  const filteredCommits = mockCommits.filter(commit => {
    const matchesSearch = commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         commit.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || commit.aiInsights.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedCommits = [...filteredCommits].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "impact":
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.aiInsights.impact] - impactOrder[a.aiInsights.impact];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Commit Intelligence</h1>
                <p className="text-slate-400">AI-powered commit analysis and insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={handlePollCommits}
                disabled={isPolling}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
                {isPolling ? 'Polling...' : 'Poll Commits'}
              </Button>
              
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="commit-stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-400 font-medium">Total Commits</p>
                  <p className="text-3xl font-bold text-white">{mockCommits.length}</p>
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

        {/* Filters and Controls */}
        <Card className="mb-8 filter-controls">
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
              Recent Commits
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
              <div className="commit-grid">
                {sortedCommits.map((commit) => (
                  <Card key={commit.id} className="commit-intelligence-card group">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={commit.author.avatar} />
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
                            
                            <div className="flex items-center space-x-6 text-sm text-slate-400">
                              <span className="flex items-center">
                                <GitCommit className="w-4 h-4 mr-1" />
                                {commit.hash}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(commit.date).toLocaleString()}
                              </span>
                              <span className="text-green-400">+{commit.additions}</span>
                              <span className="text-red-400">-{commit.deletions}</span>
                              <span>{commit.filesChanged} files</span>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">AI Summary</span>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-xs text-green-400 font-medium">AI</span>
                                </div>
                              </div>
                              <p className="text-sm text-white">{commit.aiSummary}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className={`text-xs ${getImpactColor(commit.aiInsights.impact)} border-current`}>
                                  {commit.aiInsights.impact} impact
                                </Badge>
                                <Badge variant="outline" className="text-xs text-blue-400 border-blue-400">
                                  {Math.round(commit.aiInsights.confidence * 100)}% confidence
                                </Badge>
                                <div className="flex space-x-1">
                                  {commit.aiInsights.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs text-slate-400 border-slate-600">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              {commit.pullRequest && (
                                <div className="flex items-center space-x-2">
                                  <GitPullRequest className="w-4 h-4 text-blue-400" />
                                  <span className="text-sm text-blue-400">PR #{commit.pullRequest.number}</span>
                                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 p-1">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Commit Activity</CardTitle>
                  <CardDescription className="text-slate-400">Daily commit patterns over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    <BarChart3 className="w-12 h-12" />
                    <span className="ml-2">Chart visualization coming soon</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Commit Types Distribution</CardTitle>
                  <CardDescription className="text-slate-400">Breakdown of commit types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    <PieChart className="w-12 h-12" />
                    <span className="ml-2">Chart visualization coming soon</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">AI-Powered Insights</CardTitle>
                <CardDescription className="text-slate-400">Intelligent analysis of your commit patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="font-semibold text-green-400">Code Quality</span>
                      </div>
                      <p className="text-sm text-white">Your commits show excellent code quality with consistent patterns and good practices.</p>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-blue-400">Productivity</span>
                      </div>
                      <p className="text-sm text-white">High commit frequency indicates active development and good momentum.</p>
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                        <span className="font-semibold text-yellow-400">Recommendations</span>
                      </div>
                      <p className="text-sm text-white">Consider adding more test commits to improve code coverage.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
