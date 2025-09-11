"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { askQuestion } from "@/lib/actions";
import MDEditor from '@uiw/react-md-editor';
import { CodeReferences } from "./CodeReferences";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface AskQuestionCardProps {
  onQuestionSaved?: () => void;
}

export function AskQuestionCard({ onQuestionSaved }: AskQuestionCardProps = {}) {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [fileReferences, setFileReferences] = useState<FileReference[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !project?.id) return;

    setIsOpen(true);
    setLoading(true);
    setAnswer("");
    setFileReferences([]);

    try {
      const { answer, files } = await askQuestion(project.id, question.trim());
      
      // Set file references immediately
      setFileReferences(files);
      
      // Set the complete answer
      setAnswer(answer);
      
      // Call the callback when question is successfully saved
      onQuestionSaved?.();
      toast.success("Question saved successfully!");
    } catch (error) {
      console.error('Error asking question:', error);
      setAnswer('Sorry, I encountered an error while processing your question.');
      toast.error("Failed to process your question. Please try again.");
    } finally {
      setLoading(false);
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
              disabled={loading}
            />
            <Button type="submit" disabled={!question.trim() || loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {project.name}
            </DialogTitle>
            <DialogDescription>
              Question: {question}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[60vh]">
            {/* Answer Section */}
            <div className="space-y-3">
              <h3 className="font-semibold">AI Answer</h3>
              <div className="border rounded-lg p-4 h-full overflow-auto">
                {loading && !answer && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing your codebase...
                  </div>
                )}
                {answer && (
                  <MDEditor.Markdown 
                    source={answer} 
                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
              </div>
            </div>

            {/* Code References Section */}
            <div className="space-y-3">
              <h3 className="font-semibold">
                Referenced Files ({fileReferences.length})
              </h3>
              <div className="h-full">
                <CodeReferences fileReferences={fileReferences} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
