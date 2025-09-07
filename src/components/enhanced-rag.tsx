"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, FileText, Search, Zap, Database, Triangle, Brain } from "lucide-react";
import { api } from "@/trpc/react";
import { AskQuestionCardEnhanced } from "./AskQuestionCardEnhanced";

interface EnhancedRAGComponentProps {
  projectId: string;
  projectName: string;
}

export function EnhancedRAGComponent({ projectId, projectName }: EnhancedRAGComponentProps) {
  const [question, setQuestion] = useState("");
  const [pgvectorResult, setPgvectorResult] = useState<any>(null);
  const [classicResult, setClassicResult] = useState<any>(null);

  // Get classic RAG stats
  const { data: classicStats, refetch: refetchClassicStats } = api.rag.getStats.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Get PGVector RAG stats
  const { data: pgvectorStats, refetch: refetchPGVectorStats } = api.rag.getPGVectorStats.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Classic RAG mutations
  const processClassicRepo = api.rag.processRepository.useMutation({
    onSuccess: () => {
      void refetchClassicStats();
    },
  });

  const clearClassicData = api.rag.clearData.useMutation({
    onSuccess: () => {
      void refetchClassicStats();
      setClassicResult(null);
    },
  });

  const queryClassic = api.rag.query.useMutation({
    onSuccess: (result) => {
      setClassicResult(result);
    },
    onError: (error) => {
      console.error("Classic query failed:", error);
      setClassicResult({
        success: false,
        error: error.message,
      });
    },
  });

  // PGVector RAG mutations
  const indexPGVector = api.rag.indexGithubRepository.useMutation({
    onSuccess: () => {
      void refetchPGVectorStats();
    },
  });

  const clearPGVectorData = api.rag.clearPGVectorData.useMutation({
    onSuccess: () => {
      void refetchPGVectorStats();
      setPgvectorResult(null);
    },
  });

  const queryPGVector = api.rag.queryPGVector.useMutation({
    onSuccess: (result) => {
      setPgvectorResult(result);
    },
    onError: (error) => {
      console.error("PGVector query failed:", error);
      setPgvectorResult({
        answer: "Sorry, I encountered an error while processing your question.",
        sources: [],
        error: error.message,
      });
    },
  });

  // Get project data for GitHub URL - using getProjects and filtering
  const { data: projects } = api.project.getProjects.useQuery();
  const project = projects?.find(p => p.id === projectId);

  const handleIndexPGVector = async () => {
    if (!project?.githubUrl) {
      alert("Please add a GitHub URL to your project first.");
      return;
    }

    try {
      await indexPGVector.mutateAsync({
        projectId,
        githubUrl: project.githubUrl,
      });
    } catch (error) {
      console.error("PGVector indexing failed:", error);
    }
  };

  const handleProcessClassic = async () => {
    if (!project?.githubUrl) {
      alert("Please add a GitHub URL to your project first.");
      return;
    }

    try {
      await processClassicRepo.mutateAsync({
        projectId,
        githubUrl: project.githubUrl,
      });
    } catch (error) {
      console.error("Classic processing failed:", error);
    }
  };

  const handleQueryPGVector = async () => {
    if (!question.trim()) return;

    try {
      await queryPGVector.mutateAsync({
        projectId,
        question: question.trim(),
        topK: 5,
      });
    } catch (error) {
      console.error("PGVector query failed:", error);
    }
  };

  const handleQueryClassic = async () => {
    if (!question.trim()) return;

    try {
      await queryClassic.mutateAsync({
        projectId,
        question: question.trim(),
        topK: 5,
      });
    } catch (error) {
      console.error("Classic query failed:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Question Card */}
      <AskQuestionCardEnhanced />
      
      {/* RAG System Management */}
      <Card className="w-full shadow-lg border-2 border-muted/50 bg-gradient-to-br from-background via-background to-muted/10">
        <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              RAG System Management
            </span>
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Manage your codebase indexing and RAG configurations for {projectName}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="pgvector" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/50 p-1">
              <TabsTrigger value="pgvector" className="flex items-center gap-3 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                  <Triangle className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">PGVector RAG</span>
                <Badge variant="default" className="ml-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Recommended
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="classic" className="flex items-center gap-3 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                  <Database className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Classic RAG</span>
                <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs">
                  Legacy
                </Badge>
              </TabsTrigger>
            </TabsList>

          {/* PGVector RAG Tab */}
          <TabsContent value="pgvector" className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lg border-2 border-muted/50 bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-950/20 dark:to-green-900/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <Triangle className="w-4 h-4 text-white" />
                    </div>
                    PGVector Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background/80 rounded-lg border">
                      <span className="font-medium">Indexed Files:</span>
                      <Badge variant="secondary" className="px-3 py-1 text-sm">
                        {pgvectorStats?.totalFiles || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/80 rounded-lg border">
                      <span className="font-medium">With Embeddings:</span>
                      <Badge variant={pgvectorStats?.filesWithEmbeddings ? "default" : "secondary"} className="px-3 py-1 text-sm">
                        {pgvectorStats?.filesWithEmbeddings || 0}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={handleIndexPGVector}
                    disabled={!project?.githubUrl || indexPGVector.isPending}
                    className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    size="lg"
                  >
                    {indexPGVector.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Indexing Repository...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Index Repository
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-muted/50 bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    Recent Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pgvectorStats?.recentFiles?.length ? (
                    <div className="space-y-2">
                      {pgvectorStats.recentFiles.slice(0, 4).map((file: any, idx: number) => (
                        <div key={idx} className="p-3 bg-background/80 rounded-lg border text-sm">
                          <span className="font-mono text-primary">{file.fileName}</span>
                        </div>
                      ))}
                      {pgvectorStats.recentFiles.length > 4 && (
                        <div className="text-center">
                          <Badge variant="outline" className="px-3 py-1">
                            +{pgvectorStats.recentFiles.length - 4} more files
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No files indexed yet</p>
                      <p className="text-xs">Click &quot;Index Repository&quot; to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Management Actions */}
            <div className="flex justify-center gap-4 pt-4 border-t border-muted/50">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => void refetchPGVectorStats()}
                className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
              >
                <Search className="w-4 h-4" />
                Refresh Stats
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => clearPGVectorData.mutate({ projectId })}
                disabled={clearPGVectorData.isPending || !pgvectorStats?.totalFiles}
                className="flex items-center gap-2"
              >
                {clearPGVectorData.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Clear All Data
              </Button>
            </div>

            {/* PGVector Results */}
            {pgvectorResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    AI Answer (Vector-Enhanced)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{pgvectorResult.answer}</p>
                  </div>
                  
                  {pgvectorResult.sources?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Relevant Files:</h4>
                      <div className="space-y-2">
                        {pgvectorResult.sources.map((source: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                            <span className="font-mono">{source.fileName}</span>
                            <Badge variant="outline">
                              {Math.round(source.similarity * 100)}% match
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => void refetchPGVectorStats()}
              >
                Refresh Stats
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => clearPGVectorData.mutate({ projectId })}
                disabled={clearPGVectorData.isPending}
              >
                Clear Index
              </Button>
            </div>
          </TabsContent>

          {/* Classic RAG Tab */}
          <TabsContent value="classic" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Classic RAG Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Documents:</span>
                    <Badge variant="secondary">
                      {classicStats?.totalDocuments || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>With Embeddings:</span>
                    <Badge variant={classicStats?.totalEmbeddings ? "default" : "secondary"}>
                      {classicStats?.totalEmbeddings || 0}
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleProcessClassic}
                    disabled={!project?.githubUrl || processClassicRepo.isPending}
                    className="w-full mt-2"
                    size="sm"
                  >
                    {processClassicRepo.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Process Repository
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Processing Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-xs">
                    <div>Total Documents: {classicStats?.totalDocuments || 0}</div>
                    <div>Total Embeddings: {classicStats?.totalEmbeddings || 0}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Classic Query Interface */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your codebase..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQueryClassic()}
                />
                <Button 
                  onClick={handleQueryClassic}
                  disabled={!question.trim() || queryClassic.isPending || !classicStats?.totalEmbeddings}
                >
                  {queryClassic.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {!classicStats?.totalDocuments && (
                <Alert>
                  <AlertDescription>
                    Process your repository first to enable Q&A.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Classic Results */}
            {classicResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    AI Answer (Classic)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      {classicResult.success ? classicResult.answer : classicResult.error}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => void refetchClassicStats()}
              >
                Refresh Stats
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => clearClassicData.mutate({ projectId })}
                disabled={clearClassicData.isPending}
              >
                Clear Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
}
