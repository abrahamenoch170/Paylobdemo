import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAiStore } from '@/store/ai';
import {
  LayoutDashboard,
  FolderOpen,
  Flag,
  CheckSquare,
  CreditCard,
  FileText,
  Wallet,
  Files,
  HelpCircle,
  MessageSquare,
  LogOut,
  MessageCircle,
  Settings
} from 'lucide-react';

const primaryItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/projects' },
  { id: 'milestones', label: 'Milestones', icon: Flag, href: '/milestones' },
  { id: 'deliverables', label: 'Deliverables', icon: CheckSquare, href: '/deliverables' },
  { id: 'rate-card', label: 'Rate Card', icon: CreditCard, href: '/rate-card' },
  { id: 'contracts', label: 'Contracts', icon: FileText, href: '/contracts' },
  { id: 'payments', label: 'Payments', icon: Wallet, href: '/payments' },
  { id: 'documents', label: 'Documents', icon: Files, href: '/documents' },
];

const secondaryItems = [
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings/integrations' },
  { id: 'help', label: 'Help', icon: HelpCircle, href: '/help' },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare, href: '/feedback' },
  { id: 'signout', label: 'Sign Out', icon: LogOut, href: '/' },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const location = useLocation();
  const openAi = useAiStore(state => state.openAi);

  const NavItem = ({ item }: { item: any }) => {
    const isActive = location.pathname.startsWith(item.href) && item.href !== '/';
    const Icon = item.icon;

    return (
      <Link
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors overflow-hidden whitespace-nowrap",
          isActive 
            ? "bg-[#F5F2ED] text-[#1C1C1C] font-medium" 
            : "text-[#8B8680] hover:bg-[#F5F2ED] hover:text-[#1C1C1C]"
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className={cn(
          "transition-opacity duration-300",
          collapsed ? "opacity-0 invisible" : "opacity-100 visible"
        )}>
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "h-screen fixed top-0 left-0 flex flex-col bg-[#FFFFFF] border-r border-[#D4CFCA] transition-all duration-300 z-40 overflow-hidden",
        collapsed ? "w-[64px]" : "w-[240px]"
      )}
    >
      <div className="h-16 flex items-center shrink-0 px-4">
        <span className={cn(
          "text-xl font-bold text-[#1C1C1C] transition-opacity duration-300",
          collapsed ? "opacity-0 invisible hidden" : "opacity-100 visible"
        )}>
          PAYLOB
        </span>
        {collapsed && <span className="font-bold text-[#1C1C1C] text-lg mx-auto">P</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1 scrollbar-custom">
        {primaryItems.map(item => <NavItem key={item.id} item={item} />)}
        
        <div className="my-4 border-t border-[#D4CFCA] mx-2 shrink-0" />
        
        {secondaryItems.map(item => <NavItem key={item.id} item={item} />)}
      </nav>

      <div className="p-4 shrink-0 mt-auto">
        <button 
          onClick={openAi}
          className={cn(
          "flex items-center justify-center bg-[#F5C800] text-[#1C1C1C] rounded-lg transition-all hover:bg-[#E5BB00] focus-ring overflow-hidden",
          collapsed ? "w-10 h-10 p-0 mx-auto rounded-full" : "w-full h-11 px-4 gap-2"
        )}>
          <MessageCircle className="w-5 h-5 shrink-0" />
          <span className={cn(
            "font-medium transition-opacity duration-300 whitespace-nowrap",
            collapsed ? "hidden opacity-0" : "block opacity-100"
          )}>
            Ask AI
          </span>
        </button>
      </div>
    </aside>
  );
}
