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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Repository Loader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No GitHub repository URL found for this project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Repository Loader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {repositoryData.stats.totalFiles}
                </div>
                <div className="text-xs text-muted-foreground">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {repositoryData.stats.totalLines.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Total Lines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(repositoryData.stats.totalCharacters / 1024)}KB
                </div>
                <div className="text-xs text-muted-foreground">Total Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(repositoryData.stats.fileTypes).length}
                </div>
                <div className="text-xs text-muted-foreground">File Types</div>
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
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {repositoryData.files.slice(0, 10).map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                    <span className="font-mono truncate">{file.path}</span>
                    <span className="text-muted-foreground">
                      {file.lines} lines, {Math.round(file.size / 1024)}KB
                    </span>
                  </div>
                ))}
                {repositoryData.files.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... and {repositoryData.files.length - 10} more files
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
