"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export default function FreelancerOnboarding() {
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        headline,
        bio,
        onboardingComplete: true,
        updatedAt: new Date()
      });
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen flex flex-col justify-center p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-[#8B8680] text-sm font-bold uppercase tracking-widest">
           <CheckCircle className="w-4 h-4 text-green-600" /> Account Created
        </div>
        <h1 className="text-3xl font-bold text-[#1C1C1C]">Setup your freelancer profile</h1>
        <p className="text-[#8B8680]">Tell clients what you do best to start sending contracts.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#1C1C1C]">Headline</label>
          <Input 
            placeholder="e.g. Senior Branding Designer & Illustrator" 
            value={headline}
            onChange={e => setHeadline(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-[#1C1C1C]">Expertise Bio</label>
          <textarea
            className="w-full min-h-[120px] p-4 rounded-xl border border-[#D4CFCA] outline-none focus:ring-2 focus:ring-[#1C1C1C] transition-all text-sm resize-none"
            placeholder="Briefly describe your process and what makes your work exceptional..."
            value={bio}
            onChange={e => setBio(e.target.value)}
          />
        </div>

        <div className="p-4 bg-[#F5F2ED] rounded-xl border border-[#D4CFCA] flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#1C1C1C] shrink-0 mt-0.5" />
          <p className="text-xs text-[#8B8680]">
            Pro tip: Clear headlines increase contract acceptance rates by 40%. You can update this anytime in settings.
          </p>
        </div>

        <Button 
          className="w-full h-12 text-lg group" 
          disabled={!headline || !bio || loading}
          onClick={handleComplete}
        >
          {loading ? 'Saving...' : (
            <>
              Finish Setup <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
