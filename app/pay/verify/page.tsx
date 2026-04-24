"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const provider = searchParams.get('provider');
  const reference = searchParams.get('reference') || searchParams.get('transaction_id');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`/api/payments/verify?provider=${provider}&reference=${reference}&transaction_id=${reference}`);
        const result = await res.json();

        if (res.ok && result.status === 'success') {
          setStatus('success');
        } else {
          throw new Error(result.error || 'Verification failed');
        }
      } catch (err: any) {
        console.error('Verify Error:', err);
        setStatus('error');
        setError(err.message);
      }
    };

    if (provider && reference) {
      verify();
    } else {
      setStatus('error');
      setError('Missing payment reference.');
    }
  }, [provider, reference]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[#1C1C1C] animate-spin" />
        <h1 className="text-xl font-bold text-[#1C1C1C]">Verifying Payment...</h1>
        <p className="text-[#8B8680]">Please do not refresh the page.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1C1C1C]">Payment Verification Failed</h1>
          <p className="text-[#8B8680]">{error || "We couldn&apos;t verify your payment."}</p>
        </div>
        <Button className="w-full" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-6">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
        <ShieldCheck className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Payment Successful</h1>
        <p className="text-[#8B8680]">Your payment has been verified and the funds are held securely in escrow.</p>
      </div>
      <div className="bg-[#F5F2ED] p-4 rounded-xl border border-[#D4CFCA]">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-[#8B8680]">REF:</span>
          <span>{reference}</span>
        </div>
      </div>
      <Button className="w-full" onClick={() => router.push('/dashboard')}>
        Continue to Dashboard
      </Button>
    </div>
  );
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 text-[#1C1C1C] animate-spin" />
        <p className="text-[#8B8680]">Loading...</p>
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}
