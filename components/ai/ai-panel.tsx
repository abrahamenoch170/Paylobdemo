'use client';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, FileCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AiPanelProps {
  projectId?: string;
  milestoneId?: string;
}

export const AiPanel: React.FC<AiPanelProps> = ({ projectId, milestoneId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string, type?: 'text'|'card', result?: any}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [fileRequest, setFileRequest] = useState(false);
  const [progress, setProgress] = useState(0);
  const [emailInput, setEmailInput] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestions = ["Compress a PDF", "Merge files", "Create a project", "Summarize this document", "Check payment status"];

  const sendToAi = async (text: string = input, fileId?: string, email?: string) => {
    if (!text && !fileId && !email) return;
    setMessages(prev => [...prev, { role: 'user', content: text || (fileId ? 'File uploaded' : 'Email provided') }]);
    setIsLoading(true);
    setStatus('Processing...');
    
    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: text }],
          context: { projectId, milestoneId, fileId, email }
        })
      });
      if (response.status === 429) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Rate limit exceeded. Please try again later." }]);
      } else {
        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message;
        
        if (assistantMessage.tool_calls) {
          // Handle tool calls (actionable items)
          const toolCall = assistantMessage.tool_calls[0];
          setMessages(prev => [...prev, { role: 'assistant', content: `Executing action: ${toolCall.function.name}`, type: 'card', result: { action: 'confirm', name: toolCall.function.name } }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage.content || "Processed", type: 'text' }]);
        }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Model unavailable. Try again." }]);
    }
    setIsLoading(false);
    setInput('');
    setEmailInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Uploading...');
    setProgress(0);
    // Simulating upload progress
    const interval = setInterval(() => {
      setProgress(p => p < 90 ? p + 10 : 90);
    }, 200);
    
    // Simulate API upload
    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      setStatus('Processing...');
      // In real scenario: const fileId = await uploadFile(file);
      const fileId = 'mock-file-id';
      sendToAi('Uploaded file: ' + file.name, fileId);
    }, 2000);
  };

  return (
    <div className={cn("fixed right-0 top-0 h-full w-96 bg-[#F5F2ED] border-l border-[#D4CFCA] transition-transform z-50", isOpen ? "translate-x-0": "translate-x-full")}>
       <div className='p-4 h-full flex flex-col'>
         <div className="flex-1 overflow-y-auto space-y-4">
           {messages.length === 0 && (
             <div className="space-y-3">
               <p className="text-sm font-semibold text-[#1C1C1C]">Start a task:</p>
               {suggestions.map(s => <Button key={s} variant="outline" className="w-full justify-start text-xs h-9 bg-white border-[#D4CFCA] hover:bg-[#EAE6DF]" onClick={() => sendToAi(s)}>{s}</Button>)}
             </div>
           )}
           {messages.map((m, i) => (
             <div key={i} className={cn("p-3 rounded-lg text-sm", m.role === 'user' ? 'bg-[#EAE6DF]' : 'bg-white border border-[#D4CFCA]')}>
               {m.content}
               {m.type === 'card' && <div className="mt-3 p-3 bg-white border border-[#D4CFCA] rounded flex items-center justify-between"><div className='flex items-center gap-2'><FileCheck size={16}/>{m.result.name}</div><Button size="sm" variant="outline">Download</Button></div>}
             </div>
           ))}
           {isLoading && <div className="text-sm text-[#8B8680] flex items-center gap-2"><Loader2 className="animate-spin" size={16}/>{status} {progress > 0 && `(${progress}%)`}</div>}
         </div>
         <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
         <div className='flex flex-col gap-2 mt-4'>
           <div className='flex gap-2'>
            <input value={input} onChange={e => setInput(e.target.value)} className='flex-1 border border-[#D4CFCA] p-2 rounded text-sm bg-white' placeholder="Ask AI..." />
            <Button onClick={() => sendToAi()} disabled={isLoading} size="icon" className="bg-[#1C1C1C] text-white"><Send size={16}/></Button>
            <Button variant="ghost" onClick={() => fileInputRef.current?.click()} size="icon" className="text-[#8B8680]"><Paperclip size={16}/></Button>
           </div>
         </div>
       </div>
       <Button className='absolute -left-12 top-10 bg-[#1C1C1C] text-white' onClick={() => setIsOpen(!isOpen)}>AI</Button>
    </div>
  );
};
