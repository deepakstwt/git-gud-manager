"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No file references available</p>
        </CardContent>
      </Card>
    );
  }

  const getFileExtension = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    // Map extensions to syntax highlighter languages
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'jsx',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'sql': 'sql',
      'sh': 'bash',
      'bash': 'bash',
    };
    return languageMap[ext || ''] || 'text';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Code References</CardTitle>
        <CardDescription>
          Files relevant to your question with similarity scores
        </CardDescription>
      </CardHeader>
      <CardContent className="h-full pb-6">
        <Tabs 
          value={selectedTab.toString()} 
          onValueChange={(value) => setSelectedTab(parseInt(value))}
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 mb-4">
            {fileReferences.slice(0, 3).map((file, index) => (
              <TabsTrigger 
                key={index} 
                value={index.toString()}
                className="text-xs px-2"
              >
                <div className="flex flex-col items-center">
                  <span className="truncate max-w-20">{file.fileName}</span>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {Math.round(file.similarity * 100)}%
                  </Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {fileReferences.map((file, index) => (
            <TabsContent 
              key={index} 
              value={index.toString()} 
              className="flex-1 min-h-0"
            >
              <div className="space-y-4 h-full">
                {/* File Info */}
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{file.fileName}</h4>
                  <Badge variant="outline">
                    {Math.round(file.similarity * 100)}% match
                  </Badge>
                </div>

                {/* Summary */}
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">
                    Summary
                  </h5>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">
                    {file.summary}
                  </p>
                </div>

                {/* Source Code */}
                <div className="flex-1 min-h-0">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">
                    Source Code
                  </h5>
                  <ScrollArea className="h-64 border rounded-lg">
                    <pre className="text-xs whitespace-pre-wrap font-mono p-4">
                      {file.sourceCode.slice(0, 2000)} {/* Limit to first 2000 chars */}
                      {file.sourceCode.length > 2000 && '\n... (truncated)'}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
