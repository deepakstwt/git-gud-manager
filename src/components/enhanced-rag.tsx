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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          AI Codebase Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about {projectName} using advanced RAG technology
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pgvector" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pgvector" className="flex items-center gap-2">
              <Triangle className="w-4 h-4" />
              PGVector RAG (New)
            </TabsTrigger>
            <TabsTrigger value="classic" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Classic RAG
            </TabsTrigger>
          </TabsList>

          {/* PGVector RAG Tab */}
          <TabsContent value="pgvector" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">PGVector Index Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Indexed Files:</span>
                    <Badge variant="secondary">
                      {pgvectorStats?.totalFiles || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>With Embeddings:</span>
                    <Badge variant={pgvectorStats?.filesWithEmbeddings ? "default" : "secondary"}>
                      {pgvectorStats?.filesWithEmbeddings || 0}
                    </Badge>
                  </div>
                  <Button 
                    onClick={handleIndexPGVector}
                    disabled={!project?.githubUrl || indexPGVector.isPending}
                    className="w-full mt-2"
                    size="sm"
                  >
                    {indexPGVector.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Indexing...
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

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Indexed Files</CardTitle>
                </CardHeader>
                <CardContent>
                  {pgvectorStats?.recentFiles?.length ? (
                    <div className="space-y-1">
                      {pgvectorStats.recentFiles.slice(0, 3).map((file: any, idx: number) => (
                        <div key={idx} className="text-xs">
                          <span className="font-mono">{file.fileName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No files indexed yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Query Interface */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your codebase... (e.g., 'How does authentication work?')"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQueryPGVector()}
                />
                <Button 
                  onClick={handleQueryPGVector}
                  disabled={!question.trim() || queryPGVector.isPending || !pgvectorStats?.filesWithEmbeddings}
                >
                  {queryPGVector.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {!pgvectorStats?.filesWithEmbeddings && (
                <Alert>
                  <AlertDescription>
                    Index your repository first to enable vector-powered Q&A.
                  </AlertDescription>
                </Alert>
              )}
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

              {!classicStats?.documentsWithEmbeddings && (
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
  );
}
