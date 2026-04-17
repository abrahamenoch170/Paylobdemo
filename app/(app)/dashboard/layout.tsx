"use client";

import { Sidebar } from '@/components/layout/sidebar';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isAuthenticated } = useRequireAuth();

  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F2ED] text-[#8B8680]">
        Loading session...
      </div>
    );
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
