'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated } = useRequireAuth();

  if (loading || !isAuthenticated) {
    return <div className="p-10 text-center">Loading session...</div>;
  }

  return <>{children}</>;
}
