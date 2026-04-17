import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Plus, CreditCard, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiStore } from '@/store/ai';

export function BottomNavBar() {
  const location = useLocation();
  const openAi = useAiStore(state => state.openAi);

  const NavItem = ({ href, icon: Icon, label, isActive }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; isActive: boolean }) => (
    <Link to={href} className={cn(
      "flex flex-col items-center justify-center w-[20%] gap-1",
      isActive ? "text-[#1C1C1C]" : "text-[#8B8680] hover:text-[#1C1C1C]"
    )}>
      <Icon className="w-[22px] h-[22px]" />
      <span className="text-[10px] font-medium">
        {label}
      </span>
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#FFFFFF] border-t border-[#D4CFCA] flex items-center justify-between px-2 z-50">
      <NavItem 
        href="/dashboard" 
        icon={Home} 
        label="Home" 
        isActive={location.pathname.startsWith('/dashboard')} 
      />
      <NavItem 
        href="/projects" 
        icon={FolderOpen} 
        label="Projects" 
        isActive={location.pathname.startsWith('/projects')} 
      />
      
      <button 
        onClick={() => console.log('Upload clicked')}
        className="flex flex-col items-center justify-center w-[20%] gap-1 group -mt-4 relative z-10"
      >
        <div className="w-12 h-12 rounded-full bg-[#F5C800] text-[#1C1C1C] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <Plus className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-medium text-[#8B8680] mt-1 group-hover:text-[#1C1C1C]">Upload</span>
      </button>

      <NavItem 
        href="/payments" 
        icon={CreditCard} 
        label="Payments" 
        isActive={location.pathname.startsWith('/payments')} 
      />
      
      <button 
        onClick={openAi}
        className="flex flex-col items-center justify-center w-[20%] gap-1 group text-[#8B8680] hover:text-[#1C1C1C]"
      >
        <MessageCircle className="w-[22px] h-[22px]" />
        <span className="text-[10px] font-medium">AI</span>
      </button>
    </nav>
  );
}
