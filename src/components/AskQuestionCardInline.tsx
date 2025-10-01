"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, Search, User, Clock, XIcon, Save, FileText } from "lucide-react";
import { CodeReferences } from "./CodeReferencesSimple";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface AskQuestionCardInlineProps {
  onQuestionSaved?: () => void;
}

export function AskQuestionCardInline({ onQuestionSaved }: AskQuestionCardInlineProps) {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [fileReferences, setFileReferences] = useState<FileReference[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();
  
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isDialogOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDialogOpen]);

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
      setIsDialogOpen(true);
    },
    onError: (error) => {
      const errorMsg = typeof error === 'string'
        ? error
        : (error && typeof (error as any).message === 'string'
            ? (error as any).message
            : 'Unknown error');
      console.error("Query failed:", errorMsg);
      toast.error("Failed to process your question. " + errorMsg);
      setAnswer("");
      setFileReferences([]);
      setIsDialogOpen(false);
    },
  });
  
  // TRPC mutation for saving the question
  const saveQuestionMutation = api.rag.queryPGVector.useMutation({
    onSuccess: () => {
      toast.success("Question saved successfully");
      handleQuestionSaved();
    },
    onError: (error) => {
      const errorMsg = typeof error === 'string' ? error : (error && typeof (error as any).message === 'string' ? (error as any).message : 'Unknown error');
      toast.error("Failed to save question: " + errorMsg);
      setIsSaving(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !project?.id) return;

    setAnswer("");
    setFileReferences([]);

    try {
      await queryMutation.mutateAsync({
        projectId: project.id,
        question: question.trim(),
        topK: 5,
      });
    } catch (error) {
      const errorMsg =
        typeof error === 'string'
          ? error
          : error && typeof (error as any).message === 'string'
            ? (error as any).message
            : 'Unknown error';
      console.error('Error asking question:', errorMsg);
    }
  };
  
  const handleSaveQuestion = async () => {
    if (!project?.id || !question.trim()) return;
    
    setIsSaving(true);
    try {
      await saveQuestionMutation.mutateAsync({
        projectId: project.id,
        question: question.trim(),
        topK: 5
      });
    } catch (error) {
      const errorMsg = typeof error === 'string' ? error : (error && typeof (error as any).message === 'string' ? (error as any).message : 'Unknown error');
      console.error('Error saving question:', errorMsg);
      setIsSaving(false);
    }
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleQuestionSaved = () => {
    // Reset the form after saving
    setQuestion("");
    setIsDialogOpen(false);
    setIsSaving(false);
    
    // Call the parent callback if provided
    if (onQuestionSaved) {
      onQuestionSaved();
    }
  };

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="w-full shadow-md border border-muted/50">
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ask a question about this project..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={queryMutation.isPending}
                    className="pl-10"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!question.trim() || queryMutation.isPending}
                >
                  {queryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
            </div>
            {queryMutation.isPending && (
              <div className="flex items-center gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Analyzing your codebase...</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Question Result Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden" showCloseButton={false}>
          <DialogTitle className="sr-only">Question Details</DialogTitle>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-gray-200 relative">
            <DialogClose 
              className="absolute right-4 top-4 p-2 rounded-full bg-white/90 text-gray-500 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleCloseDialog}
            >
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Close dialog</span>
            </DialogClose>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-10 leading-tight">
              {question}
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">You</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 font-medium">{format(new Date(), 'PPp')}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-primary/20"
                onClick={handleSaveQuestion}
                disabled={isSaving}
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </div>
          
          {/* Content Area with Scrolling */}
          <div className="flex-1 overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100">
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 h-full overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)] transition-all duration-300`}>
              {/* Answer Section - Left Side */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4 sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-2 z-10">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">AI Answer</h3>
                    <p className="text-xs text-gray-600">Generated response with relevant insights</p>
                  </div>
                </div>
                
                <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                  <ScrollArea className="h-full p-4 sm:p-6 max-h-[calc(90vh-250px)]">
                    <div className="prose prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-pre:overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* File References Section - Right Side */}
              {fileReferences && fileReferences.length > 0 && (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4 sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-2 z-10">
                    <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Referenced Files ({fileReferences.length})
                      </h3>
                      <p className="text-xs text-gray-600">Source code files with similarity scores</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    <ScrollArea className="h-full p-4 sm:p-6 max-h-[calc(90vh-250px)]">
                      <CodeReferences fileReferences={fileReferences} />
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}