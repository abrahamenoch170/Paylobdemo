import * as React from 'react';
import { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

export interface ChangeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestoneId?: string;
  initialType?: 'new_deliverable' | 'scope_modification' | 'rush_request' | 'paid_revision';
  onSuccess?: () => void;
}

export function ChangeOrderModal({ 
  isOpen, 
  onClose, 
  projectId, 
  milestoneId,
  initialType = 'scope_modification',
  onSuccess 
}: ChangeOrderModalProps) {
  const [type, setType] = useState(initialType);
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!description.trim() || !fee) return;
    setIsSubmitting(true);
    
    try {
      const coRef = await addDoc(collection(db, 'changeOrders'), {
        projectId,
        milestoneId: milestoneId || null,
        type,
        description,
        additionalFee: parseFloat(fee),
        revisedDeadline: deadline || null,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h expiration
      });

      // Send simulated email
      await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'client@example.com',
          subject: 'Change Order Request Received',
          template: 'change-order-requested',
          data: { changeOrderId: coRef.id }
        })
      }).catch(() => {});

      if (onSuccess) onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to submit change order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#D4CFCA] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1C1C1C]">Request Change Order</h2>
          <button onClick={onClose} className="p-2 text-[#8B8680] hover:bg-[#F5F2ED] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
           <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 items-start text-amber-900">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                Change orders modify the original scope. Your client must approve this request before work continues or funds are secured.
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Type of Change</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'new_deliverable', label: 'New Deliverable' },
                    { id: 'scope_modification', label: 'Scope Modification' },
                    { id: 'rush_request', label: 'Rush Request' },
                    { id: 'paid_revision', label: 'Paid Revision' }
                  ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setType(t.id as any)}
                      className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                        type === t.id 
                        ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' 
                        : 'bg-white text-[#1C1C1C] border-[#D4CFCA] hover:bg-[#F5F2ED]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Detailed Description</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Explain the changes and why they are necessary..."
                  className="w-full min-h-[100px] p-3 rounded-lg border border-[#D4CFCA] text-sm focus:ring-2 focus:ring-[#1C1C1C] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Additional Fee ($)</label>
                  <Input 
                    type="number" 
                    value={fee}
                    onChange={e => setFee(e.target.value)}
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1C1C1C] uppercase tracking-wider">Revised Deadline (Optional)</label>
                  <Input 
                    type="date" 
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                  />
                </div>
              </div>
           </div>
        </div>

        <div className="p-6 bg-[#F5F2ED] border-t border-[#D4CFCA] flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!description.trim() || !fee}>
            Send to Client
          </Button>
        </div>
      </div>
    </div>
  );
}
