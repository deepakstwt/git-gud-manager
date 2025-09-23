"use client";

import { useState, useEffect, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { AskQuestionCardInline } from "@/components/AskQuestionCardInline";
import { CodeReferences } from "@/components/CodeReferences";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MDEditor from "@uiw/react-md-editor";
import { Loader2, MessageSquare, User, RefreshCcw, Search, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface Question {
  id: string;
  text: string;
  answer: string;
  fileReferences: FileReference[];
  createdAt: Date;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    emailAddress: string;
  };
}

const QAPage = () => {
  const { project } = useProject();
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();

  const { data: questions, isLoading, error, refetch } = api.project.getQuestions.useQuery(
    { projectId: project?.id || "" },
    { enabled: !!project?.id }
  );

  // Filter questions based on search query
  const filteredQuestions =
    questions?.filter((question) =>
      question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${question.user.firstName} ${question.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.user.emailAddress.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const selectedQuestion = selectedQuestionIndex !== null ? filteredQuestions[selectedQuestionIndex] : null;

  const handleQuestionClick = (index: number) => {
    setSelectedQuestionIndex(index);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setSelectedQuestionIndex(null);
    }, 300);
  };

  // Keyboard shortcuts and focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isDialogOpen) handleDialogClose();
      if ((event.metaKey || event.ctrlKey) && event.key === "r" && !isDialogOpen) {
        event.preventDefault();
        refetch();
      }
    };

    if (isDialogOpen && closeButtonRef.current) {
      setTimeout(() => closeButtonRef.current?.focus(), 100);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, refetch]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = isDialogOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDialogOpen]);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please select a project to view Q&A</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Ask Question Card */}
      <div className="mb-8">
        <AskQuestionCardInline onQuestionSaved={refetch} />
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground drop-shadow-sm">Saved Questions</h1>
            {questions && (
              <span className="text-sm font-semibold text-primary ml-1">
                ({filteredQuestions.length}{searchQuery && ` of ${questions.length}`})
              </span>
            )}
          </div>
          <Button
            onClick={() => {
              refetch();
              toast.success("Questions refreshed!");
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Search Bar */}
        {questions && questions.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions, answers, or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading questions...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Error loading questions</h3>
              <p className="text-muted-foreground text-center mb-4">
                {error.message || "Failed to load questions. Please try again."}
              </p>
              <Button
                onClick={() => {
                  refetch();
                  toast.success("Retrying...");
                }}
                variant="outline"
                size="sm"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : !questions || questions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No questions yet</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Ask your first question above to start building your knowledge base for this project.
              </p>
            </CardContent>
          </Card>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No matching questions</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Try adjusting your search terms or{" "}
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary underline hover:opacity-80"
                >
                  clear the search
                </button>
                .
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                className="group flex items-start gap-4 bg-card text-card-foreground rounded-lg p-4 shadow-sm border border-border cursor-pointer hover:shadow-md hover:ring-1 hover:ring-primary/20 transition-all duration-200"
                onClick={() => handleQuestionClick(index)}
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {question.user.imageUrl ? (
                    <img src={question.user.imageUrl} alt="User avatar" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {question.user.firstName && question.user.lastName
                        ? `${question.user.firstName} ${question.user.lastName}`
                        : question.user.emailAddress}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-foreground text-base font-medium line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {question.text}
                  </p>
                  <p className="text-muted-foreground text-sm line-clamp-2 group-hover:text-foreground transition-colors">
                    {question.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Question Details */}
      {isDialogOpen && selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300 ease-in-out ${
              isDialogOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={handleDialogClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 transition-all duration-300 ease-in-out ${
              isDialogOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="question-detail-title"
            ref={modalRef}
          >
            <div className="bg-card text-card-foreground rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-border transition-all duration-300 ease-in-out">
              {/* Header */}
              <div className="bg-gradient-to-r from-[hsl(var(--primary)/0.08)] via-[hsl(var(--secondary)/0.08)] to-[hsl(var(--accent)/0.10)] p-6 border-b border-border relative">
                <button
                  onClick={handleDialogClose}
                  className="absolute right-4 top-4 p-2 rounded-full bg-card/90 hover:bg-card text-muted-foreground hover:text-foreground transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Close dialog"
                  ref={closeButtonRef}
                >
                  <XIcon className="h-5 w-5" />
                </button>

                <h2 id="question-detail-title" className="text-2xl font-bold text-foreground mb-4 pr-10 leading-tight">
                  {selectedQuestion.text}
                </h2>

                <div className="flex items-center gap-3 text-sm">
                  {selectedQuestion.user.imageUrl ? (
                    <img
                      src={selectedQuestion.user.imageUrl}
                      alt="User avatar"
                      className="w-8 h-8 rounded-full ring-2 ring-white/50 shadow-md"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] rounded-full flex items-center justify-center shadow-md">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className="font-semibold text-foreground">
                    {selectedQuestion.user.firstName && selectedQuestion.user.lastName
                      ? `${selectedQuestion.user.firstName} ${selectedQuestion.user.lastName}`
                      : selectedQuestion.user.emailAddress}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground font-medium">
                    {format(new Date(selectedQuestion.createdAt), "PPp")}
                  </span>
                </div>
              </div>

              {/* Content Area with Scrolling */}
              <div className="flex-1 overflow-hidden bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--muted))] to-[hsl(var(--background))]">
                <div
                  className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"} gap-4 sm:gap-6 p-4 sm:p-6 md:p-8 h-full overflow-y-auto custom-scrollbar max-h-[calc(90vh-120px)] transition-all duration-300`}
                >
                  {/* Answer Section - Left Side */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-4 sticky top-0 bg-gradient-to-r from-[hsl(var(--background))] to-[hsl(var(--muted))] py-2 z-10">
                      <div className="p-2.5 bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.85)] rounded-xl shadow-lg">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">AI Answer</h3>
                        <p className="text-xs text-muted-foreground">Generated response with relevant insights</p>
                      </div>
                    </div>

                    <div className="flex-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                      <div className="h-full overflow-auto p-4 sm:p-6 custom-scrollbar max-h-[calc(90vh-250px)]">
                        <div className="prose prose-base max-w-none prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-pre:overflow-x-auto">
                          <MDEditor.Markdown source={selectedQuestion.answer} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File References Section - Right Side */}
                  {selectedQuestion.fileReferences &&
                  Array.isArray(selectedQuestion.fileReferences) &&
                  selectedQuestion.fileReferences.length > 0 ? (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-4 mb-4 sticky top-0 bg-gradient-to-r from-[hsl(var(--background))] to-[hsl(var(--muted))] py-2 z-10">
                        <div className="p-2.5 bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] rounded-xl shadow-lg">
                          <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            Referenced Files ({selectedQuestion.fileReferences.length})
                          </h3>
                          <p className="text-xs text-muted-foreground">Source code files with similarity scores</p>
                        </div>
                      </div>

                      <div className="flex-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                        <div className="h-full overflow-auto p-4 sm:p-6 custom-scrollbar max-h-[calc(90vh-250px)]">
                          <CodeReferences fileReferences={selectedQuestion.fileReferences as unknown as FileReference[]} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAPage;
