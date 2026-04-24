"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/store/auth';
import { UserCircle, Briefcase, ArrowRight } from 'lucide-react';

export default function RoleSelectionPage() {
  const [role, setRole] = useState<'freelancer' | 'client' | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const setAuthRole = useAuthStore((state) => state.setRole);
  const router = useRouter();

  const handleComplete = async () => {
    if (!role || !user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role,
        onboardingComplete: role === 'client',
        updatedAt: new Date(),
      });
      setAuthRole(role);

      if (role === 'freelancer') {
        router.push('/freelancer/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-bold text-[#1C1C1C]">How will you use Paylob?</h1>
        <p className="text-[#8B8680] text-lg max-w-md mx-auto">
          Select your primary role. You can always collaborate in different ways later.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        <button
          onClick={() => setRole('freelancer')}
          className={`group p-8 rounded-2xl border-2 transition-all text-left space-y-4 ${
            role === 'freelancer' ? 'border-[#1C1C1C] bg-[#F5F2ED] shadow-md' : 'border-[#D4CFCA] hover:border-[#1C1C1C] bg-white'
          }`}
        >
          <div className={`p-4 rounded-xl w-fit transition-colors ${role === 'freelancer' ? 'bg-[#1C1C1C] text-white' : 'bg-[#F5F2ED] text-[#1C1C1C]'}`}>
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1C]">I&apos;m a Freelancer</h3>
            <p className="text-sm text-[#8B8680]">I want to send secure delivery-linked invoices and get paid on time.</p>
          </div>
        </button>

        <button
          onClick={() => setRole('client')}
          className={`group p-8 rounded-2xl border-2 transition-all text-left space-y-4 ${
            role === 'client' ? 'border-[#1C1C1C] bg-[#F5F2ED] shadow-md' : 'border-[#D4CFCA] hover:border-[#1C1C1C] bg-white'
          }`}
        >
          <div className={`p-4 rounded-xl w-fit transition-colors ${role === 'client' ? 'bg-[#1C1C1C] text-white' : 'bg-[#F5F2ED] text-[#1C1C1C]'}`}>
            <UserCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1C1C1C]">I&apos;m a Client</h3>
            <p className="text-sm text-[#8B8680]">I want to hire talent with escrow protection and verified deliveries.</p>
          </div>
        </button>
      </div>

      <div className="mt-12 w-full max-w-3xl flex justify-end">
        <Button size="lg" disabled={!role || loading} onClick={handleComplete} className="px-8 group">
          {loading ? (
            'Saving...'
          ) : (
            <>
              Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
