import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, SendHorizontal } from 'lucide-react';
import { useAiStore } from '@/store/ai';
import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';
import { usePathname, useParams } from 'next/navigation';

const renderMessageContent = (text: string) => {
  if (!text) return null;
  // Basic markdown link parser to render nice download buttons
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
    }
    parts.push(
      <a 
        key={match.index} 
        href={match[2]} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/20 rounded-xl px-3 py-1.5 mt-2 mb-1 text-sm font-semibold transition-colors"
      >
        <span className="shrink-0 group-hover:scale-110 transition-transform">⬇️</span>
        {match[1]}
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  return <div className="whitespace-pre-wrap">{parts}</div>;
};

export function AiPanel() {
  const { isOpen, closeAi } = useAiStore();
  const [messages, setMessages] = useState<{role: 'user'|'ai'|'system', content: string}[]>([
    { role: 'ai', content: "Hi! I'm your Paylob AI Assistant. How can I help you draft your contracts and manage payments?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isLoading]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, { role: 'user', content: userMsg }].map(m => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content })),
          context: { path: pathname, ...params }
        })
      });
      
      const data = await response.json();
      const aiReply = data?.choices?.[0]?.message?.content || "I'm having trouble processing that request right now.";
      
      setMessages(prev => [...prev, { role: 'ai', content: aiReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: 'Connection error communicating with AI server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Draft a milestone contract",
    "Explain the escrow process",
    "How do I request a revision?"
  ];

  const content = (
    <div className="fixed inset-0 z-[100] pointer-events-none flex justify-end p-0 md:p-4 md:pt-20">
      {/* Mobile Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto md:hidden transition-opacity" 
        onClick={closeAi} 
      />
      
      {/* Glass Panel */}
      <div className="w-full md:w-[420px] h-[100vh] md:h-[calc(100vh-100px)] pointer-events-auto flex flex-col bg-white/70 dark:bg-[#1C1C1C]/70 backdrop-blur-3xl saturate-[1.8] border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] md:rounded-[32px] overflow-hidden animate-in slide-in-from-right-8 fade-in duration-300">
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/20 bg-white/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-orange-500 flex items-center justify-center p-1.5 shadow-sm">
                <Sparkles className="w-full h-full text-white" />
            </div>
            <span className="font-semibold text-[#1C1C1C] tracking-tight text-lg">Paylob AI</span>
          </div>
          <button onClick={closeAi} className="p-2 text-[#8B8680] hover:text-[#1C1C1C] hover:bg-black/5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'ai' && (
                 <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-orange-500 shrink-0 mt-1 mr-3 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3 h-3 text-white" />
                 </div>
              )}
              {m.role === 'system' ? (
                <div className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100 mx-auto">
                  {renderMessageContent(m.content)}
                </div>
              ) : (
                <div className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-[#1C1C1C] text-white rounded-[24px] rounded-br-[8px]' 
                    : 'bg-white/80 border border-white border-b-black/5 text-[#1C1C1C] rounded-[24px] rounded-tl-[8px]'
                }`}>
                  {renderMessageContent(m.content)}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start items-end gap-2">
               <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-orange-500 shrink-0 mt-1 mr-3 flex items-center justify-center opacity-70 animate-pulse">
                  <Sparkles className="w-3 h-3 text-white" />
               </div>
               <div className="bg-white/80 border border-white px-4 py-3 rounded-[24px] rounded-tl-[8px] flex items-center gap-1.5 h-11 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#8B8680] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-[#8B8680] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-[#8B8680] rounded-full animate-bounce" />
               </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  onClick={() => setInput(s)}
                  className="text-sm bg-white/60 border border-white/40 text-[#1C1C1C] rounded-full px-4 py-2 hover:bg-white/90 shadow-sm transition-all text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white/40 border-t border-white/20 shrink-0">
          <div className="relative flex items-end bg-white/80 border border-black/5 rounded-[28px] overflow-hidden shadow-sm shadow-black/5 ring-1 ring-transparent focus-within:ring-violet-500/30 transition-all p-1">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything..."
              rows={input.split('\n').length > 1 ? Math.min(input.split('\n').length, 4) : 1}
              className="w-full bg-transparent resize-none pl-4 pr-12 py-3.5 text-[15px] focus:outline-none placeholder:text-[#8B8680]"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2.5 bg-gradient-to-tr from-[#1C1C1C] to-[#2D2D2D] text-white rounded-full disabled:opacity-50 disabled:from-[#D4CFCA] disabled:to-[#D4CFCA] transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center"
            >
              <SendHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="text-[10px] text-center mt-2 text-[#8B8680] uppercase tracking-widest font-semibold opacity-70">
            Powered by Paylob AI
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
