"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, History, Trash2, Clock, Brain, FileText, Search } from "lucide-react";
import { CodeReferences } from "./CodeReferencesSimple";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface HistoryQuestion {
  id: string;
  text: string;
  answer: string;
  fileReferences: FileReference[];
  createdAt: string;
}

export function AskQuestionCardEnhanced() {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [fileReferences, setFileReferences] = useState<FileReference[]>([]);
  const [activeTab, setActiveTab] = useState("current");

  // TRPC hooks
  const queryMutation = api.rag.queryPGVector.useMutation({
    onSuccess: (result) => {
      setAnswer(result.answer);
      const mappedSources = result.sources.map(source => ({
        fileName: source.fileName,
        summary: source.summary,
        sourceCode: source.sourceCode || '',
        similarity: source.similarity,
      }));
      setFileReferences(mappedSources);
      // Refetch history to show the new question
      historyQuery.refetch();
    },
    onError: (error) => {
      console.error("Query failed:", error);
      setAnswer("Sorry, I encountered an error while processing your question. Please try again.");
      setFileReferences([]);
    },
  });

  const historyQuery = api.rag.getQuestionHistory.useQuery(
    { projectId: project?.id || "", limit: 20 },
    { enabled: !!project?.id && isOpen }
  );

  const deleteQuestionMutation = api.rag.deleteQuestion.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
    }
  });

  const clearHistoryMutation = api.rag.clearQuestionHistory.useMutation({
    onSuccess: () => {
      historyQuery.refetch();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !project?.id) return;

    setIsOpen(true);
    setActiveTab("current");
    setAnswer("");
    setFileReferences([]);

    try {
      await queryMutation.mutateAsync({
        projectId: project.id,
        question: question.trim(),
        topK: 5,
      });
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const handleQuestionFromHistory = (historyQuestion: any) => {
    setQuestion(historyQuestion.text);
    setAnswer(historyQuestion.answer);
    // Handle JSON parsing for file references
    const references = Array.isArray(historyQuestion.fileReferences) 
      ? historyQuestion.fileReferences 
      : [];
    setFileReferences(references);
    setActiveTab("current");
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await deleteQuestionMutation.mutateAsync({ questionId });
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!project?.id) return;
    try {
      await clearHistoryMutation.mutateAsync({ projectId: project.id });
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setAnswer("");
    setFileReferences([]);
    setQuestion("");
  };

  if (!project) {
    return null;
  }

  return (
    <>
      <Card className="w-full shadow-lg border-2 hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-background via-background to-muted/20">
        <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            AI Code Assistant
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Ask natural language questions about your codebase. Get intelligent answers with contextual file references and code insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="What would you like to know about this project? (e.g., 'How is authentication handled?' or 'Explain the database schema')"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={queryMutation.isPending}
                    className="flex-1 h-14 text-base pl-12 pr-4 border-2 focus:border-primary/50 transition-all duration-200"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!question.trim() || queryMutation.isPending}
                  size="lg"
                  className="px-8 h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {queryMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
              </div>
            </div>
            {queryMutation.isPending && (
              <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-xl border border-primary/20">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
                <div>
                  <span className="font-medium text-foreground">Analyzing your codebase...</span>
                  <p className="text-muted-foreground text-xs mt-1">Searching through files and generating intelligent response</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[90vw] xl:max-w-7xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-background via-background to-muted/10">
          <DialogHeader className="pb-6 border-b border-border/50">
            <DialogTitle className="flex items-center gap-4 text-2xl font-bold">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {project.name}
                </span>
                <span className="text-muted-foreground"> - AI Assistant</span>
              </div>
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground mt-2">
              Get AI-powered insights about your codebase with contextual file references and code analysis
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[78vh] mt-6">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-muted/50 p-1">
              <TabsTrigger value="current" className="flex items-center gap-3 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-primary" />
                </div>
                <span className="font-medium">Current Question</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-3 py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <History className="w-3 h-3 text-primary" />
                </div>
                <span className="font-medium">History</span>
                <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs">
                  {historyQuery.data?.questions.length || 0}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="h-full mt-0">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                {/* Answer Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      AI Response
                    </h3>
                    {question && (
                      <div className="max-w-md">
                        <Badge variant="outline" className="text-sm px-4 py-2 bg-muted/50 border-primary/20">
                          <MessageSquare className="w-3 h-3 mr-2" />
                          {question.slice(0, 50)}{question.length > 50 ? '...' : ''}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Card className="h-[58vh] shadow-lg border-2 border-muted/50">
                    <CardContent className="p-8 h-full">
                      <ScrollArea className="h-full">
                        {queryMutation.isPending && (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="relative">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                              </div>
                              <div className="absolute -inset-2 rounded-full border-2 border-primary/20 animate-pulse"></div>
                            </div>
                            <div>
                              <p className="text-xl font-semibold text-foreground mb-2">Analyzing Your Codebase</p>
                              <p className="text-muted-foreground">Searching through files and generating intelligent response...</p>
                            </div>
                          </div>
                        )}
                        {answer && (
                          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code: ({ className, children, ...props }) => (
                                  <code
                                    className={`${className} bg-primary/10 text-primary px-2 py-1 rounded-md text-sm font-mono font-medium`}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-muted/50 p-6 rounded-xl text-sm overflow-auto border-2 border-muted font-mono leading-relaxed">
                                    {children}
                                  </pre>
                                ),
                                h1: ({ children }) => (
                                  <h1 className="text-2xl font-bold mt-8 mb-6 border-b-2 border-primary/20 pb-3 text-foreground">{children}</h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="text-xl font-semibold mt-6 mb-4 text-foreground">{children}</h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="text-lg font-medium mt-5 mb-3 text-foreground">{children}</h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-5 leading-relaxed text-foreground text-base">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-5 ml-6 space-y-2">{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-5 ml-6 space-y-2">{children}</ol>
                                ),
                                li: ({ children }) => (
                                  <li className="text-foreground">{children}</li>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-primary pl-6 italic bg-primary/5 p-6 rounded-r-xl my-6">
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {answer}
                            </ReactMarkdown>
                          </div>
                        )}
                        {!queryMutation.isPending && !answer && (
                          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                              <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <div>
                              <p className="text-xl font-semibold text-foreground mb-2">Ready to Help</p>
                              <p className="text-muted-foreground">Ask a question to get AI-powered insights about your codebase</p>
                            </div>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Code References Section */}
                <div className="space-y-6">
                  <h3 className="font-bold text-xl flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    Code References
                    <Badge variant="secondary" className="ml-2 px-3 py-1">
                      {fileReferences.length} files
                    </Badge>
                  </h3>
                  <Card className="h-[58vh] shadow-lg border-2 border-muted/50">
                    <CardContent className="p-6 h-full">
                      <CodeReferences fileReferences={fileReferences} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full mt-0">
              <div className="space-y-6 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xl flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <History className="w-4 h-4 text-white" />
                    </div>
                    Question History
                  </h3>
                  {(historyQuery.data?.questions?.length ?? 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearHistory}
                      disabled={clearHistoryMutation.isPending}
                      className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground border-2 hover:border-destructive transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </Button>
                  )}
                </div>

                <Card className="h-[62vh] shadow-lg border-2 border-muted/50">
                  <CardContent className="p-6 h-full">
                    <ScrollArea className="h-full">
                      {historyQuery.isLoading && (
                        <div className="flex items-center justify-center py-16">
                          <div className="text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                            <p className="text-lg font-semibold">Loading history...</p>
                          </div>
                        </div>
                      )}

                      {historyQuery.data?.questions.length === 0 && (
                        <div className="text-center py-20 space-y-6">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mx-auto">
                            <History className="w-12 h-12 text-muted-foreground/50" />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold mb-3">No Questions Yet</h4>
                            <p className="text-lg text-muted-foreground mb-4">Start exploring your codebase with AI-powered questions</p>
                            <p className="text-sm text-muted-foreground">Your conversation history will appear here for easy reference</p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {historyQuery.data?.questions.map((q) => (
                          <Card key={q.id} className="cursor-pointer hover:bg-gradient-to-r hover:from-muted/30 hover:to-muted/10 transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20 group">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div 
                                  className="flex-1 space-y-4"
                                  onClick={() => handleQuestionFromHistory(q)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Clock className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-sm text-muted-foreground font-medium">
                                      {format(new Date(q.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                    </span>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                      <p className="font-semibold text-base leading-relaxed text-foreground">{q.text}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4 border">
                                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                        {q.answer.slice(0, 250)}...
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="text-xs px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                      <FileText className="w-3 h-3 mr-1" />
                                      {Array.isArray(q.fileReferences) ? q.fileReferences.length : 0} files
                                    </Badge>
                                    <Badge variant="outline" className="text-xs px-3 py-1 border-primary/30 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                                      Click to view
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteQuestion(q.id);
                                  }}
                                  disabled={deleteQuestionMutation.isPending}
                                  className="opacity-40 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 w-8 h-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
