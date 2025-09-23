'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useProject from '@/hooks/use-project';

export default function MeetingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { project, projectId } = useProject();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (projectId && pathname === '/meetings') {
      router.push(`/meetings/${projectId}`);
    }
  }, [projectId, router, pathname]);

  return <>{children}</>;
}
