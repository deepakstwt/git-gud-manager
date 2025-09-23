import { Suspense } from 'react';
import { MeetingsPageClient } from './page.client';

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MeetingsPageClient />
    </Suspense>
  );
}
