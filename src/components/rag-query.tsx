"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare, FileText, Search, Zap } from "lucide-react";
import { api } from "@/trpc/react";

interface RAGQueryComponentProps {
  projectId: string;
  projectName: string;
}

export function RAGQueryComponent({ projectId, projectName }: RAGQueryComponentProps) {
  const [question, setQuestion] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);

  // Get RAG stats
  const { data: stats, refetch: refetchStats } = api.rag.getStats.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  // Process repository mutation
  const processRepo = api.rag.processRepository.useMutation({
    onSuccess: () => {
      void refetchStats();
    },
  });

  // Clear data mutation
  const clearData = api.rag.clearData.useMutation({
    onSuccess: () => {
      void refetchStats();
      setQueryResult(null);
    },
  });

  // Query mutation
  const queryMutation = api.rag.query.useMutation({
    onSuccess: (result) => {
      setQueryResult(result);
    },
    onError: (error) => {
      console.error("Query failed:", error);
      setQueryResult({
        success: false,
        error: "Failed to process query",
        answer: "Sorry, I encountered an error while processing your question.",
        context: [],
      });
    },
  });

  const handleQuery = async () => {
    if (!question.trim()) return;

    queryMutation.mutate({
      projectId,
      question: question.trim(),
      topK: 5,
    });
  };

  const isQuerying = queryMutation.isPending;

  // Get project data for GitHub URL
  const { data: projects } = api.project.getProjects.useQuery();
  const project = projects?.find(p => p.id === projectId);

  const handleProcessRepository = async () => {
    if (!project?.githubUrl) {
      alert("Please add a GitHub URL to your project first.");
      return;
    }

    try {
      await processRepo.mutateAsync({
        projectId,
        githubUrl: project.githubUrl,
        githubToken: undefined, // Optional, could be from user settings
      });
    } catch (error) {
      console.error("Processing failed:", error);
    }
  };

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all RAG data? This cannot be undone.")) {
      try {
        await clearData.mutateAsync({ projectId });
      } catch (error) {
        console.error("Clear failed:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Code Assistant</h2>
          <p className="text-muted-foreground">
            Ask questions about your codebase using RAG-powered AI
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Repository Status
          </CardTitle>
          <CardDescription>
            Current status of your codebase analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalDocuments}</div>
                <div className="text-sm text-muted-foreground">Files Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalSummaries}</div>
                <div className="text-sm text-muted-foreground">Summaries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalEmbeddings}</div>
                <div className="text-sm text-muted-foreground">Embeddings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.avgSummaryLength}</div>
                <div className="text-sm text-muted-foreground">Avg Summary Length</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No data processed yet</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleProcessRepository}
              disabled={processRepo.isPending}
              size="sm"
            >
              {processRepo.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Process Repository
                </>
              )}
            </Button>

            {stats && stats.totalDocuments > 0 && (
              <Button
                onClick={handleClearData}
                disabled={clearData.isPending}
                variant="outline"
                size="sm"
              >
                {clearData.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  "Clear Data"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Query Interface */}
      {stats && stats.totalDocuments > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ask Questions
            </CardTitle>
            <CardDescription>
              Ask natural language questions about your codebase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., What React components are available? How is authentication handled?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isQuerying && handleQuery()}
              />
              <Button
                onClick={handleQuery}
                disabled={isQuerying || !question.trim()}
              >
                {isQuerying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Suggested Questions */}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Try these questions:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "What is this project about?",
                  "What React components are available?",
                  "How is styling handled?",
                  "What APIs are exposed?",
                  "How is authentication implemented?",
                ].map((suggestion) => (
                  <Badge
                    key={suggestion}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => setQuestion(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query Result */}
      {queryResult && (
        <Card>
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
          </CardHeader>
          <CardContent>
            {queryResult.success ? (
              <div className="space-y-4">
                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertDescription className="whitespace-pre-wrap">
                    {queryResult.answer}
                  </AlertDescription>
                </Alert>

                {queryResult.context && queryResult.context.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Relevant Files:</h4>
                    <div className="space-y-2">
                      {queryResult.context.map((doc: any, index: number) => (
                        <div
                          key={index}
                          className="border rounded p-3 bg-muted/30"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{doc.fileName}</span>
                            <Badge variant="secondary">
                              {(doc.similarity * 100).toFixed(1)}% match
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  {queryResult.error || "Failed to process query"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
