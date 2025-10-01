import { Suspense } from 'react';
import { MeetingsPageClient } from '../page.client';

export default async function ProjectMeetingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingsPageClient projectId={projectId} />
    </Suspense>
  );
}
