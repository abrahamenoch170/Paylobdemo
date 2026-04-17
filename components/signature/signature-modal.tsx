import * as React from 'react';
import { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureData: string) => void;
}

export function SignatureModal({ isOpen, onClose, onConfirm }: SignatureModalProps) {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const sigCanvas = useRef<SignatureCanvas>(null);

  if (!isOpen) return null;

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleConfirm = () => {
    if (!agreed) return;
    
    let data = '';
    if (mode === 'draw' && sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) return;
      data = sigCanvas.current.toDataURL();
    } else if (mode === 'type') {
      if (!typedName) return;
      data = typedName; // In a real app we'd generate an image or handle text signature
    }
    onConfirm(data);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0A]/40 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-xl shadow-xl flex flex-col animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#D4CFCA]">
          <h2 className="text-xl font-bold text-[#1C1C1C]">Sign Contract</h2>
          <button onClick={onClose} className="p-2 text-[#8B8680] hover:text-[#1C1C1C] hover:bg-[#F5F2ED] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={mode === 'draw'} onChange={() => setMode('draw')} className="accent-[#1C1C1C]" />
              <span className="text-sm font-medium">Draw Signature</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={mode === 'type'} onChange={() => setMode('type')} className="accent-[#1C1C1C]" />
              <span className="text-sm font-medium">Type Name</span>
            </label>
          </div>

          <div className="border border-[#D4CFCA] rounded-lg overflow-hidden bg-[#F5F2ED]">
            {mode === 'draw' ? (
              <div className="relative h-48">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="#1C1C1C"
                  canvasProps={{ className: 'w-full h-full' }}
                />
                <button onClick={handleClear} className="absolute top-2 right-2 text-xs font-medium text-[#8B8680] hover:text-[#1C1C1C]">
                  Clear
                </button>
              </div>
            ) : (
              <div className="p-4 h-48 flex items-center justify-center">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Type your name"
                  className="w-full text-center text-4xl bg-transparent focus:outline-none placeholder:text-[#D4CFCA]"
                  style={{ fontFamily: '"Brush Script MT", cursive' }}
                />
              </div>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3">
            <input 
              type="checkbox" 
              id="agree terms" 
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 accent-[#1C1C1C]" 
            />
            <label htmlFor="agree terms" className="text-sm text-[#8B8680]">
              I agree to the terms and conditions and understand that this electronic signature is legally binding.
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[#D4CFCA]">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button disabled={!agreed || (mode === 'type' && !typedName)} onClick={handleConfirm}>
            Confirm Signature
          </Button>
        </div>
      </div>
    </div>
  );
}
