import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

export function Step1Scope({ onNext }: { onNext: () => void }) {
  const [description, setDescription] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [isPricing, setIsPricing] = useState(false);

  const handleAutoPrice = () => {
    setIsPricing(true);
    setTimeout(() => {
      // Simulate calling AI + Rate Card to estimate price based on description
      setSuggestedPrice(description.length > 50 ? 1200 : 500);
      setIsPricing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1C1C1C] mb-1">Project Scope</h2>
        <p className="text-sm text-[#8B8680]">Define the work to be delivered.</p>
      </div>

      <div className="space-y-4">
        <Input placeholder="Project Title" defaultValue="Fresh Prints Branding" />
        <Input placeholder="Client Email" defaultValue="client@freshprints.co" type="email" />
        
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">Description</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full min-h-[120px] p-3 rounded-lg border border-[#D4CFCA] outline-none focus:ring-2 focus:ring-[#1C1C1C] resize-none"
            placeholder="Describe the deliverables in detail..."
          ></textarea>
        </div>

        <div className="bg-[#F5F2ED] p-4 rounded-xl border border-[#D4CFCA] flex flex-col md:flex-row items-center gap-4 justify-between">
           <div>
             <h3 className="font-bold text-[#1C1C1C] text-sm">Rate Card Auto-Pricing</h3>
             <p className="text-xs text-[#8B8680]">Let AI analyze your scope and suggest a price based on your standard rates.</p>
           </div>
           <div className="flex items-center gap-3 w-full md:w-auto">
             {suggestedPrice !== null && (
               <span className="font-bold text-green-600">${suggestedPrice}</span>
             )}
             <Button variant="secondary" size="sm" onClick={handleAutoPrice} disabled={isPricing || description.length < 10} className="gap-2 shrink-0">
               <Sparkles className="w-4 h-4" /> 
               {isPricing ? 'Analyzing...' : 'Suggest Price'}
             </Button>
           </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">Acceptance Criteria</label>
          <textarea 
            className="w-full min-h-[80px] p-3 rounded-lg border border-[#D4CFCA] outline-none focus:ring-2 focus:ring-[#1C1C1C] resize-none"
            placeholder="Be as objective and verifiable as possible."
          ></textarea>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button onClick={onNext}>Next: Milestones</Button>
      </div>
    </div>
  );
}
