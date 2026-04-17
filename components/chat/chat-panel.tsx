import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Send, Paperclip, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { sanitizeText } from '@/lib/sanitize';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: { toDate?: () => Date } | null;
  attachments?: string[];
  type: 'text' | 'system' | 'ai_warning';
}

interface ChatPanelProps {
  projectId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [scopeWarning, setScopeWarning] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;

    const messagesRef = collection(db, 'projects', projectId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [projectId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const handleAttachFile = async (file: File) => {
    if (!user) return;
    const form = new FormData();
    form.append('file', file);
    form.append('projectId', projectId);

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: form,
        headers: {
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      const messagesRef = collection(db, 'projects', projectId, 'messages');
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        content: `Attachment: ${file.name}`,
        attachments: [uploadData.url],
        type: 'text',
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Attachment error:', error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const messagesRef = collection(db, 'projects', projectId, 'messages');
      
      // Send message
      await addDoc(messagesRef, {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        content: newMessage,
        type: 'text',
        timestamp: serverTimestamp()
      });

      // AI Scope Monitoring (Simulation)
      // In a real app, this would call /api/ai/process
      const outOfScopeKeywords = ['extra', 'feature', 'new page', 'revision', 'change'];
      const isOutOfScope = outOfScopeKeywords.some(kw => newMessage.toLowerCase().includes(kw));
      
      if (isOutOfScope) {
        setScopeWarning("Our AI detected potential out-of-scope requests. Should we create a Change Order?");
      } else {
        setScopeWarning(null);
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border border-[#D4CFCA] rounded-2xl bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#D4CFCA] bg-[#F5F2ED] flex justify-between items-center">
        <h3 className="font-bold text-[#1C1C1C]">Project Communication</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F6]">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={cn(
              "flex flex-col max-w-[80%]",
              msg.senderId === user?.uid ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className="text-[10px] text-[#8B8680] mb-1 px-1">
              {msg.senderName} • {msg.timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={cn(
              "px-4 py-2 rounded-2xl text-sm",
              msg.senderId === user?.uid 
                ? "bg-[#1C1C1C] text-white rounded-tr-none" 
                : "bg-white border border-[#D4CFCA] text-[#1C1C1C] rounded-tl-none"
            )}>
              {sanitizeText(msg.content)}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Scope Warning Banner */}
      {scopeWarning && (
        <div className="bg-orange-50 border-t border-orange-200 p-3 flex items-center justify-between text-xs text-orange-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{scopeWarning}</span>
          </div>
          <Button variant="tertiary" size="sm" className="h-7 text-orange-800 hover:bg-orange-100 font-bold underline">
            Create Change Order
          </Button>
        </div>
      )}

      {/* Input */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAttachFile(f); }} />
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#D4CFCA] flex gap-2 bg-white">
        <Button type="button" variant="tertiary" size="icon" className="shrink-0 text-[#8B8680]" onClick={() => fileInputRef.current?.click()}>
          <Paperclip className="w-5 h-5" />
        </Button>
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[#F5F2ED] border-none focus-visible:ring-1 focus-visible:ring-[#1C1C1C]"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};
