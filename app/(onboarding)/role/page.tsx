'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export function OnboardingWizard() {
  const [step, setStep] = useState(1);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Onboarding Step {step}</h1>
      {/* Wizard fields */}
      <Button onClick={() => setStep(step + 1)}>Next</Button>
    </div>
  );
}
