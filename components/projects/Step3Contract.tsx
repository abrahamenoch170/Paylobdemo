import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SignatureModal } from '@/components/signature/signature-modal';
import { CheckCircle } from 'lucide-react';

export function Step3Contract({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [isSignOpen, setSignOpen] = useState(false);
  const [isSigned, setSigned] = useState(false);

  const handleSignConfirm = () => {
    setSigned(true);
    setSignOpen(false);
  };

  const handleSend = () => {
    console.log("Contract sent to client");
    router.push('/dashboard'); // Go back to dashboard as active project
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1C1C1C] mb-1">Contract Preview & Sign</h2>
        <p className="text-sm text-[#8B8680]">Review the generated terms and sign as the freelancer.</p>
      </div>

      <div className="bg-[#F5F2ED] p-6 rounded-xl border border-[#D4CFCA] max-h-64 overflow-y-auto font-mono text-sm space-y-4">
        <p><strong>SERVICE AGREEMENT</strong></p>
        <p>This agreement outlines the scope of work between Kola (Freelancer) and Client.</p>
        <p>1. SCOPE: Fresh Prints Branding</p>
        <p>2. TERMS: Total $500 to be paid prior to deliverable release.</p>
        <p>3. IP: Intellectual property transfers entirely upon successful completion and settlement of the milestone.</p>
        <p><em>(Auto-generated contract based on standard terms)</em></p>
      </div>

      <div className="border border-[#D4CFCA] rounded-xl p-6">
        <h3 className="font-bold text-[#1C1C1C] mb-4">Your Signature</h3>
        {isSigned ? (
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle className="w-5 h-5" />
            Signed electronically
          </div>
        ) : (
          <Button variant="secondary" onClick={() => setSignOpen(true)}>Sign Document</Button>
        )}
      </div>

      <div className="pt-6 border-t border-[#D4CFCA] flex justify-between items-center">
        <Button variant="tertiary" onClick={onBack}>Back</Button>
        <Button onClick={handleSend} disabled={!isSigned} className={!isSigned ? "opacity-50" : ""}>
          Send Contract to Client
        </Button>
      </div>

      <SignatureModal isOpen={isSignOpen} onClose={() => setSignOpen(false)} onConfirm={handleSignConfirm} />
    </div>
  );
}
