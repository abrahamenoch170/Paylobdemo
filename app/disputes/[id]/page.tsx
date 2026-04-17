"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { AlertOctagon, Scale, History, ShieldCheck, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DisputeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [dispute, setDispute] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const dSnap = await getDoc(doc(db, 'disputes', id));
        if (dSnap.exists()) {
          setDispute({ id: dSnap.id, ...dSnap.data() });
        } else {
           // mock fallback
           setDispute({
              id,
              category: 'Quality of Work',
              status: 'OPEN',
              description: 'The deliverables provided do not match the agreed upon acceptance criteria for the branding assets.',
              createdAt: { toDate: () => new Date() },
              auditLog: [
                { action: 'Dispute Filed', notes: 'Client filed a dispute regarding milestone 1.', timestamp: new Date() }
              ]
           });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-[#8B8680]">Loading dispute details...</div>;
  if (!dispute) return <div className="p-12 text-center text-red-500">Dispute not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertOctagon className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Dispute Case</h1>
          </div>
          <p className="text-sm font-mono text-[#8B8680] uppercase tracking-widest">{id}</p>
          <p className="text-[#1C1C1C] font-semibold">Project Integrity Investigation • Category: {dispute.category}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl font-bold border uppercase text-xs tracking-widest ${
          dispute.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
        }`}>
          {dispute.status === 'OPEN' ? 'Under Review' : 'Resolved'}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border text-sm border-[#D4CFCA] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#D4CFCA] bg-[#FAFAFA] flex justify-between items-center">
               <h2 className="font-bold text-[#1C1C1C] uppercase tracking-[0.1em] text-xs">Client Allegation</h2>
               <span className="text-[10px] text-[#8B8680] font-bold">
                 {dispute.createdAt?.toDate ? dispute.createdAt.toDate().toLocaleString() : new Date().toLocaleString()}
               </span>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-[#8B8680] text-xs font-bold uppercase tracking-wider">Statement:</div>
              <p className="text-[#1C1C1C] text-base leading-relaxed">
                {dispute.description}
              </p>
              
              <div className="flex gap-2">
                 <div className="p-2 rounded-lg border border-[#D4CFCA] flex items-center gap-2 text-xs text-[#8B8680] bg-[#F5F2ED] hover:text-[#1C1C1C] cursor-pointer transition-colors">
                    <Download className="w-3.5 h-3.5" /> evidence_pack_01.zip
                 </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white border text-sm border-[#D4CFCA] rounded-2xl overflow-hidden shadow-sm opacity-60">
            <div className="p-6 border-b border-[#D4CFCA] bg-[#FAFAFA]">
               <h2 className="font-bold text-[#1C1C1C] uppercase tracking-[0.1em] text-xs">Freelancer Rebuttal</h2>
            </div>
            <div className="p-8 text-center space-y-3">
              <History className="w-8 h-8 text-[#8B8680] mx-auto opacity-50" />
              <p className="text-[#8B8680] font-medium uppercase tracking-widest text-[10px]">
                Awaiting response from freelancer...
              </p>
              <div className="text-[10px] bg-amber-50 text-amber-800 px-3 py-1 rounded-full inline-block">
                Submissions window closes in 42 hours
              </div>
            </div>
          </div>

          <div className="bg-white border text-sm border-[#D4CFCA] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[#D4CFCA] bg-[#FAFAFA] flex items-center gap-2">
               <ShieldCheck className="w-4 h-4 text-[#1C1C1C]" />
               <h2 className="font-bold text-[#1C1C1C] uppercase tracking-[0.1em] text-xs">Audit Log</h2>
            </div>
            <div className="divide-y divide-[#D4CFCA]">
               {(dispute.auditLog || []).map((log: any, i: number) => (
                 <div key={i} className="p-4 flex gap-4 text-xs">
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0" />
                    <div>
                      <div className="font-bold text-[#1C1C1C]">{log.action}</div>
                      <div className="text-[#8B8680] mt-0.5">{log.notes}</div>
                      <div className="text-[10px] text-[#8B8680] mt-1 font-mono">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#1C1C1C] text-white rounded-2xl p-6 shadow-xl space-y-6 border border-[#1C1C1C]">
             <div className="flex items-center gap-2 mb-2">
               <Scale className="w-5 h-5 text-white" />
               <h3 className="font-bold uppercase tracking-[0.1em] text-sm">Resolution Panel</h3>
             </div>
             <p className="text-[10px] text-white/50 leading-relaxed">
               Paylob Arbitration Team will review contract terms, communication logs, and hashes to determine a fair settlement.
             </p>
             <div className="space-y-3">
               <Button variant="secondary" className="w-full justify-between hover:bg-white hover:text-[#1C1C1C] text-xs h-11 border-white/20">
                 Full Release to Freelancer
               </Button>
               <Button variant="secondary" className="w-full justify-between text-red-100 border-red-500/30 hover:bg-red-900/40 text-xs h-11">
                 Full Refund to Client
               </Button>
               <Button className="w-full justify-between bg-white text-[#1C1C1C] hover:bg-slate-200 text-xs h-11">
                 Split Settlement
               </Button>
             </div>
           </div>

           <div className="p-6 bg-white border border-[#D4CFCA] rounded-2xl">
              <h4 className="text-[10px] font-bold text-[#8B8680] uppercase tracking-widest mb-4">Relevant Contract</h4>
              <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl hover:bg-[#EAE6DF] cursor-pointer transition-colors border border-[#D4CFCA]">
                 <FileText className="w-5 h-5 flex-shrink-0" />
                 <div className="text-xs truncate">
                    <div className="font-bold text-[#1C1C1C] truncate">Project_Agreement_Signed.pdf</div>
                    <div className="text-[#8B8680]">Digital Signature Valid</div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
