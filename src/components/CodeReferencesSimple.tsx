"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Code, Zap, Search } from "lucide-react";

interface FileReference {
  fileName: string;
  summary: string;
  sourceCode: string;
  similarity: number;
}

interface CodeReferencesProps {
  fileReferences: FileReference[];
}

export function CodeReferences({ fileReferences }: CodeReferencesProps) {
  const [selectedTab, setSelectedTab] = useState(0);

  if (!fileReferences.length) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div className="space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
            <Search className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <div>
            <p className="font-semibold text-xl mb-3 text-foreground">No File References</p>
            <p className="text-muted-foreground text-base">Ask a question to see relevant files from your codebase</p>
            <p className="text-muted-foreground text-sm mt-2">I&apos;ll find the most relevant code files to answer your question</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="space-y-6 h-full">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Most relevant files from your codebase with AI similarity scores
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {fileReferences.length} files found
            </Badge>
          </div>
        </div>
        <Tabs 
          value={selectedTab.toString()} 
          onValueChange={(value) => setSelectedTab(parseInt(value))}
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 mb-6 h-auto bg-muted/50 p-1">
            {fileReferences.slice(0, 3).map((file, index) => (
              <TabsTrigger 
                key={index} 
                value={index.toString()}
                className="text-xs px-4 py-4 flex flex-col items-center gap-2 h-auto data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="truncate max-w-28 font-medium text-foreground">{file.fileName}</span>
                  <Badge 
                    variant={Math.round(file.similarity * 100) > 80 ? "default" : "secondary"} 
                    className="text-xs px-2 py-0.5"
                  >
                    {Math.round(file.similarity * 100)}% match
                  </Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {fileReferences.map((file, index) => (
            <TabsContent 
              key={index} 
              value={index.toString()} 
              className="flex-1 min-h-0 mt-0"
            >
              <Card className="h-full shadow-lg border-2 border-muted/50">
                <CardContent className="p-6 h-full space-y-6">
                  {/* File Info Header */}
                  <div className="flex items-center justify-between border-b pb-4 border-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">{file.fileName}</h4>
                        <p className="text-sm text-muted-foreground">Relevant code file</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={Math.round(file.similarity * 100) > 80 ? "default" : "secondary"} 
                        className="px-4 py-2 text-sm font-semibold"
                      >
                        {Math.round(file.similarity * 100)}% similarity
                      </Badge>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                        <FileText className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <h5 className="text-sm font-bold text-foreground uppercase tracking-wide">
                        File Summary
                      </h5>
                    </div>
                    <div className="bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-5 rounded-xl border-2 border-muted/50">
                      <p className="text-sm leading-relaxed text-foreground font-medium">
                        {file.summary}
                      </p>
                    </div>
                  </div>

                  {/* Source Code Section */}
                  <div className="flex-1 min-h-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                        <Code className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h5 className="text-sm font-bold text-foreground uppercase tracking-wide">
                        Source Code Preview
                      </h5>
                    </div>
                    <ScrollArea className="h-56 border-2 rounded-xl bg-gradient-to-br from-muted/20 via-background to-muted/10 border-muted/50">
                      <div className="p-6">
                        <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-foreground">
                          {file.sourceCode.slice(0, 3000)}
                          {file.sourceCode.length > 3000 && (
                            <span className="text-muted-foreground italic bg-muted/30 px-2 py-1 rounded mt-3 inline-block">
                              ... (showing first 3000 characters - {file.sourceCode.length - 3000} more characters available)
                            </span>
                          )}
                        </pre>
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
