'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface NotificationItem {
  id: string;
  message: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) })));
    });
    return () => unsub();
  }, [user]);

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {items.map((n) => (
        <div key={n.id} className="p-3 bg-white border rounded-lg flex justify-between">
          <span className={n.read ? 'text-[#8B8680]' : 'text-[#1C1C1C]'}>{n.message}</span>
          {!n.read && <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>Mark read</Button>}
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-[#8B8680]">No notifications yet.</p>}
    </div>
  );
}
