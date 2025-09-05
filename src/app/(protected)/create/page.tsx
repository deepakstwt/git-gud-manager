'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import useProject from '@/hooks/use-project';

export default function CreateProjectPage() {
  const [name, setName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const router = useRouter();
  const { refetchProjects } = useRefetch();
  const { setProjectId } = useProject();

  const createProjectMutation = api.project.createProject.useMutation({
    onSuccess: async (data) => {
      toast.success(`Project "${data.name}" created successfully!`);
      
      // Set the newly created project as active
      setProjectId(data.id);
      
      // Refresh project list to show the new project immediately
      await refetchProjects();
      
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Project creation error:', error);
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const testQuery = api.project.test.useQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    createProjectMutation.mutate({
      name: name.trim(),
      githubUrl: githubUrl.trim() || undefined,
      githubToken: githubToken.trim() || undefined,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Create a new project to start analyzing your codebase
            {testQuery.data && (
              <div className="mt-2 text-sm text-green-600">
                ✅ tRPC Status: {testQuery.data.message}
              </div>
            )}
            {testQuery.error && (
              <div className="mt-2 text-sm text-red-600">
                ❌ tRPC Error: {testQuery.error.message}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                type="url"
                placeholder="https://github.com/username/repository"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubToken">GitHub Token (Optional)</Label>
              <Input
                id="githubToken"
                type="password"
                placeholder="GitHub personal access token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="flex-1"
              >
                {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
