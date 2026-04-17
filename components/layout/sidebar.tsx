"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CreditCard, 
  ShieldCheck, 
  Settings, 
  LogOut,
  PlusCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Security', href: '/settings', icon: ShieldCheck },
  { name: 'Chat Assistant', href: '/assistant', icon: MessageSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-[#D4CFCA] h-screen shrink-0 sticky top-0">
      <div className="p-6">
        <Link href="/dashboard" className="text-2xl font-bold text-[#1C1C1C] tracking-tight">
          PAYLOB
        </Link>
      </div>

      <div className="px-6 mb-8">
        <Link 
          href="/projects/new"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#1C1C1C] text-white rounded-xl text-sm font-bold hover:bg-[#1C1C1C]/90 transition-all shadow-sm group"
        >
          <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Project
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive 
                  ? "bg-[#F5F2ED] text-[#1C1C1C]" 
                  : "text-[#8B8680] hover:bg-[#F5F2ED] hover:text-[#1C1C1C]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-[#1C1C1C]" : "text-[#8B8680]")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-[#D4CFCA]">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
