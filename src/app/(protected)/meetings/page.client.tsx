'use client';

import { useState } from 'react';
import { MeetingCard } from '@/components/MeetingCard';
import { MeetingList } from '@/components/MeetingList';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import useProject from '@/hooks/use-project';
import { Skeleton } from '@/components/ui/skeleton';

export function MeetingsPageClient({ projectId: propProjectId }: { projectId?: string } = {}) {
  const [showUpload, setShowUpload] = useState(false);
  const { project, projectId: hookProjectId } = useProject();
  const projectId = propProjectId || hookProjectId;

  if (!projectId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Please select a project from the sidebar to view meetings
          </p>
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Button 
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Meeting
        </Button>
      </div>

      {showUpload && (
        <div className="mt-4">
          <MeetingCard projectId={projectId} />
        </div>
      )}

      <div className="mt-6">
        <MeetingList projectId={projectId} />
      </div>
    </div>
  );
}
