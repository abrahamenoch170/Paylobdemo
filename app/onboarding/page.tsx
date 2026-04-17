'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UnifiedOnboardingPage() {
  const [role, setRole] = useState<'client' | 'freelancer' | null>(null);
  const router = useRouter();

  const handleFinish = () => {
    if (role) {
      // Save profile and redirect
      router.push('/dashboard');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Welcome to Paylob</h1>
      <div className="flex gap-4">
        <Button onClick={() => setRole('client')} variant={role === 'client' ? 'default' : 'outline'}>Client</Button>
        <Button onClick={() => setRole('freelancer')} variant={role === 'freelancer' ? 'default' : 'outline'}>Freelancer</Button>
      </div>
      <div>
        <label>Your Name:</label>
        <input className="border p-2 w-full" placeholder="Enter name" />
      </div>
      <Button onClick={handleFinish} disabled={!role}>Complete Setup</Button>
    </div>
  );
}
