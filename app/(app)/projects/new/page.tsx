"use client";

import * as React from 'react';
import { useState } from 'react';
import { Step1Scope } from '@/components/projects/Step1Scope';
import { Step2Milestones } from '@/components/projects/Step2Milestones';
import { Step3Contract } from '@/components/projects/Step3Contract';

export default function NewProjectPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C1C1C] mb-4">Create New Project</h1>
        
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#1C1C1C]' : 'bg-[#D4CFCA]'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#1C1C1C]' : 'bg-[#D4CFCA]'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#1C1C1C]' : 'bg-[#D4CFCA]'}`} />
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#D4CFCA] shadow-sm">
        {step === 1 && <Step1Scope onNext={() => setStep(2)} />}
        {step === 2 && <Step2Milestones onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <Step3Contract onBack={() => setStep(2)} />}
      </div>
    </div>
  );
}
