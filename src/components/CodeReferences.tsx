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
    <div className="h-full flex flex-col">
      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <h4 className="text-base font-bold text-gray-900">Code References</h4>
        <p className="text-sm text-gray-600 mt-2">
          Files relevant to your question with similarity scores
        </p>
      </div>
      <div className="flex-1 p-6">
        <Tabs 
          value={selectedTab.toString()} 
          onValueChange={(value) => setSelectedTab(parseInt(value))}
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-3 mb-6 w-full h-auto bg-gradient-to-r from-white to-gray-50 border border-purple-100 rounded-lg shadow-sm">
            {fileReferences.slice(0, 3).map((file, index) => (
              <TabsTrigger 
                key={index} 
                value={index.toString()}
                className="text-sm px-4 py-4 flex-1 h-auto data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white font-medium transition-all duration-200 hover:shadow-md rounded-md"
              >
                <div className="flex flex-col items-center w-full gap-2">
                  <span className="truncate max-w-24 text-center text-xs font-medium">{file.fileName}</span>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2 py-1">
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
              <div className="space-y-6 h-full">
                {/* File Info */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-gray-900">{file.fileName}</h4>
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 font-medium">
                      {Math.round(file.similarity * 100)}% match
                    </Badge>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                  <h5 className="text-sm font-bold text-blue-900 mb-3">
                    Summary
                  </h5>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {file.summary}
                  </div>
                </div>

                {/* Source Code */}
                <div className="flex-1 min-h-0 bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h5 className="text-sm font-bold text-gray-900 mb-3">
                    Source Code
                  </h5>
                  <ScrollArea className="h-80 border rounded-lg bg-slate-900 shadow-md" orientation="both">
                    <SyntaxHighlighter
                      language={getFileExtension(file.fileName)}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.75rem',
                        lineHeight: '1.4',
                        background: 'transparent',
                        minWidth: '100%'
                      }}
                      showLineNumbers
                      wrapLines={false}
                    >
                      {file.sourceCode.slice(0, 3000)} {/* Limit to first 3000 chars */}
                      {file.sourceCode.length > 3000 ? '\n... (truncated)' : ''}
                    </SyntaxHighlighter>
                  </ScrollArea>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
