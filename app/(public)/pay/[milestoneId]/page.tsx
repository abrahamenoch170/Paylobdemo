"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, ShieldCheck, CreditCard, Landmark, Smartphone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Milestone } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/auth-modal';

export default function PaymentPage() {
  const params = useParams();
  const id = params.milestoneId as string;
  const router = useRouter();
  const { user } = useAuth();
  const [provider, setProvider] = useState<'paystack' | 'flutterwave'>('paystack');
  const [method, setMethod] = useState<'card' | 'bank' | 'ussd'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (id) {
      getDoc(doc(db, 'milestones', id)).then(snap => {
        if (snap.exists()) {
          setMilestone(snap.data() as Milestone);
        } else {
          setMilestone({
            id: id,
            projectId: 'proj-123',
            title: 'Development Milestone',
            description: 'Core feature development',
            amount: 500.00,
            state: 'SIGNED',
            revisionLimit: 2,
            revisionUsed: 0,
            dueDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            acceptanceCriteria: 'Functional UI and API'
          } as unknown as Milestone);
        }
      });
    }
  }, [id]);

  if (!milestone) {
    return <div className="text-center py-12 text-[#8B8680]">Loading milestone data...</div>;
  }

  const totalAmount = milestone.amount;
  const calculatedFee = totalAmount * 0.02;
  const platformFee = calculatedFee > 50 ? 50 : calculatedFee;
  const finalAmount = totalAmount + platformFee;

  const handlePay = async () => {
    if (finalAmount >= 2000 && !user) {
      setShowAuthModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId: id,
          provider,
          amount: finalAmount,
          email: user?.email || 'guest@paylob.app',
          name: user?.displayName || 'Guest User'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize payment');
      }

      const checkoutUrl = provider === 'paystack' 
        ? result.data.data.authorization_url 
        : result.data.data.link;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL returned from provider');
      }
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "UNKNOWN";
      console.error('Payment Error:', error);
      const message = error instanceof Error ? error.message : 'Failed to process payment. Please try again.';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12 p-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1C] mb-2">Complete Payment for {milestone.title}</h1>
        <div className="text-sm text-[#8B8680]">
          {milestone.description}
        </div>
      </div>

      <div className="bg-white border border-[#D4CFCA] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 bg-[#F5F2ED] border-b border-[#D4CFCA]">
          <h2 className="text-lg font-bold text-[#1C1C1C] mb-4">Milestone Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[#8B8680]">Milestone Value</span>
              <span className="font-semibold text-[#1C1C1C]">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8B8680]">Platform Fee (2% upto $50)</span>
              <span className="font-semibold text-[#1C1C1C]">${platformFee.toFixed(2)}</span>
            </div>
            <div className="pt-4 mt-4 border-t border-[#D4CFCA] flex justify-between items-center">
              <span className="text-xl font-bold text-[#1C1C1C]">Total Payable</span>
              <span className="text-2xl font-bold text-[#1C1C1C]">${finalAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm text-[#8B8680]">
            <Lock className="w-4 h-4 shrink-0" />
            <span>Unlocks: {milestone.deliverables?.join(', ') || 'Milestone Deliverables'}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wider">Select Provider</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setProvider('paystack')}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  provider === 'paystack' 
                  ? 'border-[#1C1C1C] bg-[#F5F2ED] ring-1 ring-[#1C1C1C]' 
                  : 'border-[#D4CFCA] hover:bg-[#F5F2ED]'
                }`}
              >
                <div className="font-bold text-[#1C1C1C] mb-1">Paystack</div>
                <div className="text-xs text-[#8B8680]">Fast & Secure</div>
              </button>
              <button
                onClick={() => setProvider('flutterwave')}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  provider === 'flutterwave' 
                  ? 'border-[#1C1C1C] bg-[#F5F2ED] ring-1 ring-[#1C1C1C]' 
                  : 'border-[#D4CFCA] hover:bg-[#F5F2ED]'
                }`}
              >
                <div className="font-bold text-[#1C1C1C] mb-1">Flutterwave</div>
                <div className="text-xs text-[#8B8680]">Global reach</div>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-[#1C1C1C] uppercase tracking-wider">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setMethod('card')} className={`flex flex-col items-center justify-center py-3 px-2 border rounded-lg gap-2 ${method === 'card' ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white' : 'border-[#D4CFCA] text-[#1C1C1C]'}`}>
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-medium">Card</span>
              </button>
              <button onClick={() => setMethod('bank')} className={`flex flex-col items-center justify-center py-3 px-2 border rounded-lg gap-2 ${method === 'bank' ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white' : 'border-[#D4CFCA] text-[#1C1C1C]'}`}>
                <Landmark className="w-5 h-5" />
                <span className="text-xs font-medium">Bank</span>
              </button>
              <button onClick={() => setMethod('ussd')} className={`flex flex-col items-center justify-center py-3 px-2 border rounded-lg gap-2 ${method === 'ussd' ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white' : 'border-[#D4CFCA] text-[#1C1C1C]'}`}>
                <Smartphone className="w-5 h-5" />
                <span className="text-xs font-medium">Mobile</span>
              </button>
            </div>
          </div>
          
          {!user && finalAmount >= 2000 && (
             <div className="flex gap-3 mt-4 items-start bg-orange-50 p-4 border border-orange-200 rounded-xl text-orange-800">
               <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
               <div className="text-sm">
                 <span className="font-semibold">Account Required.</span> For transactions over $2,000, we prioritize your security. Create an account to track this escrow payment.
               </div>
             </div>
          )}
        </div>

        <div className="p-6 border-t border-[#D4CFCA] bg-white">
          <Button className="w-full" size="lg" onClick={handlePay} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : `Pay $${finalAmount.toFixed(2)}`}
          </Button>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="signup" />
    </div>
  );
}
