"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, ArrowRight, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useAuthStore } from '@/store/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = useAuthStore(state => state.role);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const field = role === 'client' ? 'clientId' : 'freelancerId';
        const pSnap = await getDocs(query(collection(db, 'projects'), where(field, '==', user.uid)));
        const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProjects(pData);

        const projectIds = pData.map(p => p.id);
        if (projectIds.length > 0) {
           const mQuery = query(collection(db, 'milestones'), where('projectId', 'in', projectIds));
           const mSnap = await getDocs(mQuery);
           setMilestones(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, role]);

  const inEscrow = milestones.filter(m => m.state === 'AUTHORIZED').reduce((acc, m) => acc + (m.amount || 0), 0);
  const availableToWithdraw = milestones.filter(m => m.state === 'SETTLED').reduce((acc, m) => acc + (m.amount || 0), 0);
  const totalSpent = milestones.filter(m => m.state === 'SETTLED').reduce((acc, m) => acc + (m.amount || 0), 0);

  const awaitingClientSig = projects.filter(p => p.status === 'DRAFT');
  const authorizedMilestones = milestones.filter(m => m.state === 'AUTHORIZED');
  const deliveredMilestones = milestones.filter(m => m.state === 'DELIVERED');

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1C1C1C]">Dashboard</h1>
          <p className="text-[#8B8680] mt-1">Welcome back. Here's what needs your attention.</p>
        </div>
        {role === 'freelancer' && (
          <Button onClick={() => router.push('/projects/new')} className="shrink-0 gap-2">
            <PlusCircle className="w-5 h-5" />
            New Project
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-[#1C1C1C]">Action Required</h2>
          
          {loading && <div className="text-sm text-[#8B8680]">Loading...</div>}
          {!loading && awaitingClientSig.length === 0 && authorizedMilestones.length === 0 && deliveredMilestones.length === 0 && (
             <div className="p-8 text-center bg-white border border-[#D4CFCA] rounded-xl text-[#8B8680]">
               You're all caught up!
             </div>
          )}

          {role === 'client' && awaitingClientSig.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-[#D4CFCA] overflow-hidden">
              <div className="p-4 border-b border-[#D4CFCA] bg-[#F5F2ED] flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#8B8680]" />
                <div className="font-semibold text-[#1C1C1C]">Signature Needed</div>
              </div>
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-[#1C1C1C]">{p.title}</div>
                  <div className="text-sm text-[#8B8680]">Freelancer sent a contract.</div>
                </div>
                <Button variant="secondary" onClick={() => router.push(`/contract/${p.id}`)} className="gap-2">
                  Review & Sign <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {role === 'client' && deliveredMilestones.map(m => {
            const p = projects.find(pr => pr.id === m.projectId);
            return (
              <div key={m.id} className="bg-white rounded-xl border border-[#D4CFCA] overflow-hidden">
                <div className="p-4 border-b border-[#D4CFCA] bg-[#F5F2ED] flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#8B8680]" />
                  <div className="font-semibold text-[#1C1C1C]">Deliverable Review</div>
                </div>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-[#1C1C1C]">{p?.title} — {m.title}</div>
                    <div className="text-sm text-[#8B8680]">Freelancer submitted deliverables for approval.</div>
                  </div>
                  <Button variant="secondary" onClick={() => router.push(`/deliver/${m.id}`)} className="gap-2">
                    Review Deliverables <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {role === 'freelancer' && awaitingClientSig.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-[#D4CFCA] overflow-hidden">
              <div className="p-4 border-b border-[#D4CFCA] bg-[#F5F2ED] flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#8B8680]" />
                <div className="font-semibold text-[#1C1C1C]">Awaiting Client Signature</div>
              </div>
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-[#1C1C1C]">{p.title}</div>
                  <div className="text-sm text-[#8B8680]">Contract sent to client.</div>
                </div>
                <Button variant="secondary" onClick={() => router.push(`/contract/${p.id}`)} className="gap-2">
                  View Contract <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {role === 'freelancer' && authorizedMilestones.map(m => {
            const p = projects.find(pr => pr.id === m.projectId);
            return (
              <div key={m.id} className="bg-white rounded-xl border border-[#D4CFCA] overflow-hidden">
                <div className="p-4 border-b border-[#D4CFCA] bg-[#F5F2ED] flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-green-500 shrink-0" />
                  <div className="font-semibold text-[#1C1C1C]">Payment Authorized</div>
                </div>
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-[#1C1C1C]">{p?.title} — {m.title}</div>
                    <div className="text-sm text-[#8B8680]">${m.amount} secured in escrow. Safe to start work.</div>
                  </div>
                  <Button onClick={() => router.push(`/milestones/${m.id}`)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    Submit Work
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1C1C1C]">Overview</h2>
          <div className="bg-white rounded-xl border border-[#D4CFCA] p-5 space-y-6">
            {role === 'freelancer' ? (
              <>
                <div>
                  <div className="text-sm text-[#8B8680] mb-1">In Escrow (Secured)</div>
                  <div className="text-3xl font-bold text-[#1C1C1C]">${inEscrow.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-[#8B8680] mb-1">Available to Withdraw</div>
                  <div className="text-3xl font-bold text-[#1C1C1C]">${availableToWithdraw.toFixed(2)}</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-sm text-[#8B8680] mb-1">Total Authorized Escrow</div>
                  <div className="text-3xl font-bold text-[#1C1C1C]">${inEscrow.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-[#8B8680] mb-1">Total Spent</div>
                  <div className="text-3xl font-bold text-[#1C1C1C]">${totalSpent.toFixed(2)}</div>
                </div>
              </>
            )}
            <div className="pt-4 border-t border-[#D4CFCA]">
              <div className="text-sm text-[#8B8680] mb-1">Active Projects</div>
              <div className="text-xl font-bold text-[#1C1C1C]">{projects.length}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
