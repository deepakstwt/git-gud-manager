import { Suspense } from 'react';
import { MeetingsPageClient } from '../page.client';

export default function ProjectMeetingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingsPageClient />
    </Suspense>
  );
}
