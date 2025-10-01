"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, FileText, MessageSquare, Save, User, Clock } from "lucide-react";
import { CodeReferences } from "./CodeReferencesSimple";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface QuestionResultCardProps {
  question: string;
  answer: string;
  fileReferences: FileReference[];
  projectId: string;
  onSaved?: () => void;
}

export function QuestionResultCard({
  question,
  answer,
  fileReferences,
  projectId,
  onSaved
}: QuestionResultCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // TRPC mutation for saving the question
  const queryMutation = api.rag.queryPGVector.useMutation({
    onSuccess: () => {
      toast.success("Question saved successfully");
      if (onSaved) onSaved();
    },
    onError: (error) => {
      toast.error("Failed to save question: " + error.message);
    }
  });

  const handleSaveQuestion = async () => {
    if (!projectId || !question.trim() || !answer.trim()) return;
    
    setIsSaving(true);
    try {
      await queryMutation.mutateAsync({
        projectId,
        question: question.trim(),
        topK: 5
      });
    } catch (error: unknown) {
      console.error('Error saving question:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-2 border-muted/50 bg-gradient-to-br from-background via-background/95 to-muted/20 mt-6 mb-8">
      <CardContent className="p-6 bg-background/95">
        {/* Header with user info and timestamp */}
        <div className="flex items-center justify-between mb-6 border-b pb-4 border-muted/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">You</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{format(new Date(), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            </div>
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

        {/* Question display */}
        <div className="mb-6">
          <Badge variant="outline" className="text-sm px-4 py-2 bg-muted/50 border-primary/20 mb-3">
            <MessageSquare className="w-3 h-3 mr-2" />
            {question}
          </Badge>
        </div>

        {/* Main content area with AI answer and file references */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Answer Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              AI Response
            </h3>
            <Card className="shadow-md border border-muted/50 h-[50vh]">
              <CardContent className="p-6 h-full">
                <ScrollArea className="h-full pr-4">
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ className, children, ...props }) => (
                          <code
                            className={`${className} bg-primary/15 text-primary px-2 py-1 rounded-md text-sm font-mono font-semibold`}
                            {...props}
                          >
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="bg-muted/80 p-6 rounded-xl text-sm overflow-auto border border-muted font-mono leading-relaxed">
                            {children}
                          </pre>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold mt-8 mb-6 border-b-2 border-primary/20 pb-3 text-foreground/90">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold mt-6 mb-4 text-foreground/90">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-medium mt-5 mb-3 text-foreground/90">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-5 leading-relaxed text-foreground/90 text-base font-medium">{children}</p>
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
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Code References Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Referenced Files
              <Badge variant="secondary" className="ml-2 px-3 py-1">
                {fileReferences.length} files
              </Badge>
            </h3>
            <Card className="shadow-md border border-muted/50 h-[50vh]">
              <CardContent className="p-4 h-full">
                <CodeReferences fileReferences={fileReferences} />
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}