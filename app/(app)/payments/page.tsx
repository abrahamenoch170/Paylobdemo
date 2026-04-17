'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

interface PaymentRow {
  id: string;
  amount?: number;
  provider?: string;
  status?: string;
  reference?: string;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<PaymentRow[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'payments'), where('customerEmail', '==', user.email || ''));
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRow, 'id'>) })));
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      {rows.length === 0 ? <p className="text-sm text-[#8B8680]">No payments yet.</p> : (
        <div className="space-y-2">
          {rows.map((p) => (
            <div key={p.id} className="p-3 bg-white border rounded-lg flex justify-between text-sm">
              <span>{p.reference || p.id}</span>
              <span>{p.provider} · {p.status} · ${p.amount || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
