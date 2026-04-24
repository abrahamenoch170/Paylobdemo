import * as React from 'react';
import { useState } from 'react';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNavBar } from '@/components/navigation/bottom-nav';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AiPanel } from '@/components/ai/ai-panel';

function NotificationCenter() {
  return null;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 968px)');
  const [collapsed, setCollapsed] = useState(false);

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] flex flex-col font-sans">
        <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-[#D4CFCA] shrink-0 sticky top-0 z-30">
           <div className="font-black text-xl tracking-tighter">PAYLOB</div>
           <NotificationCenter />
        </header>
        <main className="flex-1 overflow-y-auto pb-20 p-4 md:p-6">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>
        <BottomNavBar />
        <AiPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex font-sans">
      <Sidebar collapsed={collapsed} />
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-h-screen",
        collapsed ? "ml-[64px]" : "ml-[240px]"
      )}>
        <div className="h-16 flex items-center justify-between px-6 shrink-0 z-30 sticky top-0 bg-[#F5F2ED]/90 backdrop-blur-sm">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 -ml-2 text-[#1C1C1C] hover:bg-[#EAE6DF] rounded-lg transition-colors"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-4">
            <NotificationCenter />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <AiPanel />
    </div>
  );
}
