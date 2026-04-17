'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

interface ChangeOrderDoc {
  description: string;
  additionalFee: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export default function ChangeOrderResponsePage() {
  const { id } = useParams<{ id: string }>();
  const [docData, setDocData] = useState<ChangeOrderDoc | null>(null);

  useEffect(() => {
    const run = async () => {
      const snap = await getDoc(doc(db, 'changeOrders', id));
      if (snap.exists()) setDocData(snap.data() as ChangeOrderDoc);
    };
    run();
  }, [id]);

  const respond = async (status: 'ACCEPTED' | 'REJECTED') => {
    await updateDoc(doc(db, 'changeOrders', id), { status, respondedAt: new Date() });
    setDocData((prev) => (prev ? { ...prev, status } : prev));
  };

  if (!docData) return <div className="p-8">Loading change order...</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Change Order</h1>
      <p>{docData.description}</p>
      <p className="text-sm">Additional fee: ${docData.additionalFee}</p>
      <p className="text-sm">Status: {docData.status}</p>
      {docData.status === 'PENDING' && (
        <div className="flex gap-2">
          <Button onClick={() => respond('ACCEPTED')}>Accept</Button>
          <Button variant="secondary" onClick={() => respond('REJECTED')}>Reject</Button>
        </div>
      )}
    </div>
  );
}
