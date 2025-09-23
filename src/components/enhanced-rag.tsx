"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  MessageSquare, 
  FileText, 
  Search, 
  Zap, 
  Database, 
  Triangle, 
  Brain,
  Sparkles,
  ArrowRight,
  Quote,
  Code,
  BookOpen,
  Layers,
  Send,
  Copy,
  Check,
  Star,
  Lightbulb,
  Cpu,
  FileSearch,
  Network
} from "lucide-react";
import { api } from "@/trpc/react";

interface EnhancedRAGComponentProps {
  projectId: string;
  projectName: string;
}

export function EnhancedRAGComponent({ projectId, projectName }: EnhancedRAGComponentProps) {
  const [question, setQuestion] = useState("");
  const [pgvectorResult, setPgvectorResult] = useState<any>(null);
  const [classicResult, setClassicResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("query");
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  // Copy to clipboard functionality
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

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

  // Suggested questions for enhanced UX
  const suggestedQuestions = [
    "How does authentication work in this codebase?",
    "What are the main API endpoints?",
    "How is data validation handled?",
    "What's the database schema structure?",
    "How does error handling work?",
    "What are the security measures implemented?"
  ];

  return (
    <div className="relative">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-full blur-3xl floating" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-secondary/5 via-secondary/3 to-transparent rounded-full blur-3xl floating-delayed" />
      </div>

      <div className="relative space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card border-0 mb-4">
            <div className="w-8 h-8 neo-card rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              AI-Powered RAG System
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Intelligent Code
            </span>
            <br />
            <span className="text-foreground">Discovery</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ask questions about your codebase using advanced retrieval-augmented generation. 
            Get precise answers with highlighted citations and context.
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Premium Tab Navigation */}
            <div className="flex justify-center mb-12">
              <TabsList className="glass-card border-0 p-2 h-14 bg-transparent">
                <TabsTrigger 
                  value="query" 
                  className="relative px-8 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Query System
                </TabsTrigger>
                <TabsTrigger 
                  value="manage" 
                  className="relative px-8 py-3 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Manage Data
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Query Interface */}
            <TabsContent value="query" className="space-y-8">
              {/* Query Input Section */}
              <div className="glass-card rounded-3xl p-8 border-0">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 neo-card rounded-2xl flex items-center justify-center group">
                      <MessageSquare className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Ask Your Codebase</h3>
                      <p className="text-muted-foreground">Natural language queries powered by AI</p>
                    </div>
                  </div>

                  {/* Enhanced Query Input */}
                  <div className="relative">
                    <div className="neo-card rounded-2xl p-1 bg-gradient-to-r from-primary/10 to-secondary/10">
                      <div className="relative bg-background rounded-xl">
                        <textarea
                          ref={textareaRef}
                          value={question}
                          onChange={(e) => {
                            setQuestion(e.target.value);
                            setIsTyping(true);
                            setTimeout(() => setIsTyping(false), 1000);
                          }}
                          placeholder="Ask anything about your codebase... (e.g., How does authentication work?)"
                          className="w-full px-6 py-4 pr-16 bg-transparent border-0 resize-none focus:outline-none placeholder:text-muted-foreground text-foreground min-h-[60px] max-h-[200px]"
                          rows={1}
                        />
                        
                        {/* Send Button */}
                        <div className="absolute right-2 bottom-2 flex gap-2">
                          {isTyping && (
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                              <span>Typing...</span>
                            </div>
                          )}
                          
                          <Button
                            onClick={handleQueryPGVector}
                            disabled={!question.trim() || queryPGVector.isPending}
                            className="magnetic-button h-10 px-4 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-0 text-white shadow-lg"
                          >
                            {queryPGVector.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggested Questions */}
                  {!pgvectorResult && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Suggested Questions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggestedQuestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setQuestion(suggestion)}
                            className="interactive-card p-4 rounded-xl bg-muted/30 hover:bg-muted/50 text-left text-sm transition-all duration-300 group border border-border/40 hover:border-primary/30"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                <ArrowRight className="w-3 h-3 text-primary" />
                              </div>
                              <span className="group-hover:text-foreground transition-colors duration-300">
                                {suggestion}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Premium Results Display */}
              {pgvectorResult && (
                <div className="space-y-6">
                  {/* AI Answer Section */}
                  <div className="glass-card rounded-3xl p-8 border-0">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 neo-card rounded-2xl flex items-center justify-center">
                        <Brain className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-foreground">AI Answer</h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(pgvectorResult.answer, 'answer')}
                            className="magnetic-button h-8 px-3"
                          >
                            {copiedStates['answer'] ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-muted-foreground mb-4">Generated using advanced RAG with vector similarity</p>
                        
                        <div className="neo-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
                          <div className="prose prose-sm max-w-none">
                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                              {pgvectorResult.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Citations */}
                  {pgvectorResult.sources && pgvectorResult.sources.length > 0 && (
                    <div className="glass-card rounded-3xl p-8 border-0">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 neo-card rounded-2xl flex items-center justify-center">
                          <Quote className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">Source Citations</h3>
                          <p className="text-muted-foreground">
                            {pgvectorResult.sources.length} relevant documents found
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {pgvectorResult.sources.map((source: any, index: number) => (
                          <div key={index} className="group">
                            <div className="interactive-card rounded-2xl p-6 border border-border/40 hover:border-primary/30 transition-all duration-300">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 neo-card rounded-xl flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-accent" />
                                  </div>
                                </div>
                                
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                        {source.fileName}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <Star className="w-3 h-3 text-amber-400" />
                                        <span className="text-xs font-medium text-amber-400">
                                          {(source.similarity * 100).toFixed(1)}% match
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(source.sourceCode, `source-${index}`)}
                                      className="magnetic-button h-8 px-3"
                                    >
                                      {copiedStates[`source-${index}`] ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>

                                  {source.summary && (
                                    <div className="p-4 rounded-xl bg-muted/30">
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {source.summary}
                                      </p>
                                    </div>
                                  )}

                                  {source.sourceCode && (
                                    <div className="relative">
                                      <div className="absolute top-3 right-3 z-10">
                                        <Badge variant="secondary" className="text-xs">
                                          <Code className="w-3 h-3 mr-1" />
                                          Source Code
                </Badge>
                                      </div>
                                      <pre className="neo-card rounded-xl p-4 bg-muted/50 text-sm overflow-x-auto custom-scrollbar">
                                        <code className="text-foreground">
                                          {source.sourceCode.slice(0, 500)}
                                          {source.sourceCode.length > 500 && '...'}
                                        </code>
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Management Interface */}
            <TabsContent value="manage" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* PGVector System */}
                <div className="glass-card rounded-3xl p-8 border-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 neo-card rounded-2xl flex items-center justify-center">
                      <Network className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Vector Database</h3>
                      <p className="text-muted-foreground">Advanced similarity search with PGVector</p>
                    </div>
                  </div>

                  {pgvectorStats && (
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="neo-card rounded-xl p-4 bg-muted/30">
                          <div className="text-2xl font-bold text-emerald-400 mb-1">
                            {pgvectorStats.totalFiles || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Documents</div>
                        </div>
                        <div className="neo-card rounded-xl p-4 bg-muted/30">
                          <div className="text-2xl font-bold text-emerald-400 mb-1">
                            {pgvectorStats.filesWithEmbeddings || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">With Embeddings</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      onClick={handleIndexPGVector}
                      disabled={indexPGVector.isPending || !project?.githubUrl}
                      className="w-full magnetic-button bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0 text-white shadow-lg"
                    >
                      {indexPGVector.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Cpu className="w-4 h-4 mr-2" />
                      )}
                      Index Repository
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => clearPGVectorData.mutate({ projectId })}
                      disabled={clearPGVectorData.isPending}
                      className="w-full magnetic-button border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      Clear Vector Data
                    </Button>
                  </div>
                </div>

                {/* Classic System */}
                <div className="glass-card rounded-3xl p-8 border-0">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 neo-card rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Classic RAG</h3>
                      <p className="text-muted-foreground">Traditional document processing</p>
                    </div>
                  </div>

                  {classicStats && (
                    <div className="space-y-4 mb-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="neo-card rounded-xl p-4 bg-muted/30">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {classicStats.totalDocuments || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Documents</div>
                        </div>
                        <div className="neo-card rounded-xl p-4 bg-muted/30">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {classicStats.totalEmbeddings || 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Processed</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      onClick={handleProcessClassic}
                      disabled={processClassicRepo.isPending || !project?.githubUrl}
                      className="w-full magnetic-button bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white shadow-lg"
                    >
                      {processClassicRepo.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <FileSearch className="w-4 h-4 mr-2" />
                      )}
                      Process Repository
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => clearClassicData.mutate({ projectId })}
                      disabled={clearClassicData.isPending}
                      className="w-full magnetic-button border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      Clear Classic Data
                    </Button>
                  </div>
                </div>
              </div>

              {/* Repository Status */}
              {!project?.githubUrl && (
                <div className="glass-card rounded-3xl p-8 border-0">
                  <Alert>
                    <Zap className="w-4 h-4" />
                    <AlertDescription className="text-lg">
                      Please add a GitHub repository URL to your project to enable RAG processing.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
