"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useRequireAuth();

  if (loading || !isAuthenticated) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#FDFCFB]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
