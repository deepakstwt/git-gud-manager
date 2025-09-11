"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, History, Trash2, Clock } from "lucide-react";
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

export function AskQuestionCardSimple() {
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
    setFileReferences((historyQuestion.fileReferences as unknown as FileReference[]) || []);
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Ask a Question
          </CardTitle>
          <CardDescription>
            Query your codebase with natural language using RAG-powered AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="Ask a question about this project..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={queryMutation.isPending}
            />
            <Button type="submit" disabled={!question.trim() || queryMutation.isPending}>
              {queryMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {project.name} - AI Assistant
            </DialogTitle>
            <DialogDescription>
              Get AI-powered answers about your codebase with file references
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[75vh]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Current Question
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History ({historyQuery.data?.questions.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="h-full mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Answer Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">AI Answer</h3>
                    {question && (
                      <Badge variant="outline" className="text-xs">
                        Question: {question.slice(0, 50)}{question.length > 50 ? '...' : ''}
                      </Badge>
                    )}
                  </div>
                  <ScrollArea className="border rounded-lg p-4 h-[60vh] bg-muted/20">
                    {queryMutation.isPending && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing your codebase...
                      </div>
                    )}
                    {answer && (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ node, className, children, ...props }: any) => {
                              const inline = !className?.includes('language-');
                              return (
                                <code
                                  className={`${className} ${inline ? 'bg-muted px-1 py-0.5 rounded text-sm' : 'block bg-muted p-3 rounded-lg text-sm overflow-auto'}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {answer}
                        </ReactMarkdown>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Code References Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Referenced Files ({fileReferences.length})
                  </h3>
                  <div className="h-[60vh]">
                    <CodeReferences fileReferences={fileReferences} />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full mt-4">
              <div className="space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Question History</h3>
                  {(historyQuery.data?.questions?.length || 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearHistory}
                      disabled={clearHistoryMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[65vh]">
                  {historyQuery.isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  )}

                  {historyQuery.data?.questions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No questions asked yet</p>
                      <p className="text-sm">Start by asking a question about your codebase</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {historyQuery.data?.questions.map((q) => (
                      <Card key={q.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div 
                              className="flex-1 space-y-2"
                              onClick={() => handleQuestionFromHistory(q)}
                            >
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {format(new Date(q.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                              <p className="font-medium text-sm">{q.text}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {q.answer.slice(0, 150)}...
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {(q.fileReferences as unknown as FileReference[] || []).length} files
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
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
