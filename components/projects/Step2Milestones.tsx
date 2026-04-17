import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Github } from 'lucide-react';

export function Step2Milestones({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [milestones, setMilestones] = useState([{ id: 1, desc: 'Logo Concept', amount: 500 }]);
  const [githubRepo, setGithubRepo] = useState('');

  const addMilestone = () => setMilestones([...milestones, { id: Date.now(), desc: '', amount: 0 }]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1C1C1C] mb-1">Milestones & Pricing</h2>
        <p className="text-sm text-[#8B8680]">Break down the work into paid milestones.</p>
      </div>

      <div className="space-y-4">
        {milestones.map((m, index) => (
          <div key={m.id} className="flex gap-3 items-start bg-[#F5F2ED] p-4 rounded-xl border border-[#D4CFCA]">
            <div className="flex-1 space-y-3">
              <Input placeholder="Milestone description" defaultValue={m.desc} />
              <div className="flex gap-3">
                <Input placeholder="Amount ($)" type="number" defaultValue={m.amount} className="w-1/2" />
                <Input placeholder="Deadline" type="date" className="w-1/2" />
              </div>
            </div>
            {milestones.length > 1 && (
              <button onClick={() => setMilestones(milestones.filter(x => x.id !== m.id))} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}

        <Button variant="secondary" className="w-full border-dashed" onClick={addMilestone}>
          <Plus className="w-4 h-4 mr-2" /> Add Milestone
        </Button>
      </div>

      <div className="bg-[#F5F2ED] p-4 rounded-xl border border-[#D4CFCA] space-y-3">
         <div className="flex items-center gap-2">
           <Github className="w-5 h-5 text-[#1C1C1C]" />
           <h3 className="font-bold text-[#1C1C1C] text-sm">Code Delivery (Optional)</h3>
         </div>
         <p className="text-xs text-[#8B8680]">Connect a GitHub repository to automatically verify technical deliverables via Pull Requests or branch merges.</p>
         <Input 
           placeholder="e.g. owner/repo-name" 
           value={githubRepo}
           onChange={(e) => setGithubRepo(e.target.value)}
           className="bg-white"
         />
      </div>

      <div className="pt-6 border-t border-[#D4CFCA] flex justify-between items-center">
        <Button variant="tertiary" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next: Contract</Button>
      </div>
    </div>
  );
}
