'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, Download } from 'lucide-react';
import { api } from '@/trpc/react';
import useProject from '@/hooks/use-project';

export default function RepositoryLoader() {
  const { project } = useProject();
  const [shouldLoad, setShouldLoad] = useState(false);

  const { data: repositoryData, isLoading, error } = api.project.loadRepositoryFiles.useQuery(
    {
      projectId: project?.id || '',
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.py', '.md', '.json'],
    },
    {
      enabled: shouldLoad && !!project?.id,
    }
  );

  const handleLoadRepository = () => {
    if (!project?.id) {
      alert('Please select a project first');
      return;
    }

    setShouldLoad(true);
  };

  if (!project?.githubUrl) {
    return (
      <Card className="bg-background/60 backdrop-blur border-border/40 shadow-lg transition-all duration-200">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-3 text-lg font-medium">
            <FileText className="w-5 h-5 text-primary/80" />
            Repository Loader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 border border-dashed border-border/60 rounded-lg bg-muted/30">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="w-6 h-6 text-primary/80" />
            </div>
            <p className="text-sm text-muted-foreground">
              No GitHub repository URL found for this project.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/60 backdrop-blur border-border/40 shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
      
      <CardHeader className="relative space-y-1">
        <CardTitle className="flex items-center gap-3 text-lg font-medium">
          <FileText className="w-5 h-5 text-primary/80" />
          <span>Repository Loader</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Repository: {project.name}</p>
            <p className="text-xs text-muted-foreground">{project.githubUrl}</p>
          </div>
          <Button
            onClick={handleLoadRepository}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Loading...' : 'Load Repository Files'}
          </Button>
        </div>

        {repositoryData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-background/40 border border-border/40 text-center transition-all hover:scale-105">
                <div className="text-2xl font-semibold text-primary/90">
                  {repositoryData.stats.totalFiles}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Files</div>
              </div>
              <div className="p-4 rounded-lg bg-background/40 border border-border/40 text-center transition-all hover:scale-105">
                <div className="text-2xl font-semibold text-primary/90">
                  {repositoryData.stats.totalLines.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Lines</div>
              </div>
              <div className="p-4 rounded-lg bg-background/40 border border-border/40 text-center transition-all hover:scale-105">
                <div className="text-2xl font-semibold text-primary/90">
                  {Math.round(repositoryData.stats.totalCharacters / 1024)}KB
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Size</div>
              </div>
              <div className="p-4 rounded-lg bg-background/40 border border-border/40 text-center transition-all hover:scale-105">
                <div className="text-2xl font-semibold text-primary/90">
                  {Object.keys(repositoryData.stats.fileTypes).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">File Types</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">File Types:</h4>
              <div className="flex flex-wrap gap-1">
                {Object.entries(repositoryData.stats.fileTypes).map(([ext, count]: [string, any]) => (
                  <Badge key={ext} variant="secondary" className="text-xs">
                    .{ext}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Sample Files ({repositoryData.files.length} loaded):</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-background/40">
                {repositoryData.files.slice(0, 10).map((file: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-background/40 border border-border/40 rounded-lg text-xs hover:bg-muted/40 transition-colors"
                  >
                    <span className="font-mono truncate text-primary/90">{file.path}</span>
                    <span className="text-muted-foreground ml-4 whitespace-nowrap">
                      {file.lines} lines, {Math.round(file.size / 1024)}KB
                    </span>
                  </div>
                ))}
                {repositoryData.files.length > 10 && (
                  <div className="text-center py-2 bg-muted/20 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      ... and {repositoryData.files.length - 10} more files
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
