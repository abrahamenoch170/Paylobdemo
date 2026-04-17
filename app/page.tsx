"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();
  const router = useRouter();

  // If user is already logged in, we check this in a useEffect or middleware
  // For now, let's just handle it here for simplicity
  if (!loading && user) {
    router.replace('/dashboard');
    return null;
  }

  const openAuth = (mode: 'login' | 'signup') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F2ED] font-sans">
        
        {/* Left Zone - Desktop 60%, Mobile 40vh */}
        <div className="w-full md:w-[60%] h-[40vh] md:h-screen flex flex-col relative p-8 md:p-16">
          <div className="text-xl font-bold text-[#1C1C1C]">
            PAYLOB
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto z-10 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1C1C1C]">
              Delivery-controlled payments for digital work
            </h1>
            <p className="text-lg text-[#8B8680]">
              PAYLOB protects freelancers by enforcing delivery-payment linkage. No chasing invoices, no getting burned.
            </p>
          </div>

          {/* Minimal geometric illustration placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none hidden md:flex">
            <div className="w-96 h-96 border-[4px] border-[#1C1C1C] rounded-[48px] rotate-12 flex items-center justify-center">
               <Lock className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Right Zone - Desktop 40%, Mobile rest */}
        <div className="w-full md:w-[40%] flex-1 md:h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-8 md:p-16 shadow-2xl z-20">
          <div className="w-full max-w-sm space-y-8 text-center">
            <div className="text-xl font-bold text-[#1C1C1C] md:hidden mb-12">
              PAYLOB
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1C1C1C]">Get Started</h2>
              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={() => openAuth('signup')}
                >
                  Create account
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => openAuth('login')}
                >
                  Sign in
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-[#8B8680] mt-12">
              A project from detova labs &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialMode={modalMode} 
      />
    </>
  );
}
