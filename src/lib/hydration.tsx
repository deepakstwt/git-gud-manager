/**
 * Utility to prevent hydration mismatches by ensuring consistent rendering
 * between server and client
 */

import { useEffect, useState } from 'react';

/**
 * Hook to check if component has hydrated on the client
 * Useful for preventing hydration mismatches
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

/**
 * Component wrapper that only renders children after hydration
 * Prevents hydration mismatches for client-only components
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Safe component for rendering content that might differ between server and client
 */
export function HydrationSafe({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hydrated = useHydrated();

  if (!hydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
