"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Lock, FileImage, Download, ThumbsUp, HelpCircle, AlertOctagon, History, FileVideo, PlusCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Milestone, FileRecord } from '@/types';
import { ChangeOrderModal } from '@/components/change-order/change-order-modal';

export default function DeliverableReviewPage() {
  const params = useParams();
  const id = params.milestoneId as string;
  const router = useRouter();
  
  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isCOModalOpen, setIsCOModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isFilingDispute, setIsFilingDispute] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const mSnap = await getDoc(doc(db, 'milestones', id));
        if (mSnap.exists()) {
          setMilestone(mSnap.data() as Milestone);
        } else {
          setMilestone({
             id, projectId: 'p-1', title: 'Example Delivery', amount: 500, state: 'DELIVERED', 
             revisionLimit: 2, revisionUsed: 0, description: 'Mock', acceptanceCriteria: '', createdAt: new Date(), updatedAt: new Date(),
             dueDate: new Date(),
             deliveryNotes: 'The deliverables have been uploaded for your review.'
          } as unknown as Milestone);
        }

        const fSnap = await getDocs(query(collection(db, 'files'), where('milestoneId', '==', id)));
        const fData = fSnap.docs.map(d => ({ id: d.id, ...d.data() } as FileRecord));
        if (fData.length === 0) {
           fData.push({
             id: 'f-1', milestoneId: id, projectId: 'p-1', 
             name: 'Brand_Assets_Preview.png', fileName: 'Brand_Assets_Preview.png',
             size: 1024, type: 'image/png', storagePath: 'mock/path', uploadedBy: 'f-1', hash: 'mock-hash',
             previewUrl: 'https://picsum.photos/seed/branding/800/600', accessState: 'PREVIEW', 
             createdAt: new Date(), uploadedAt: new Date()
           } as unknown as FileRecord);
        }
        setFiles(fData);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      if (id && id !== '1' && milestone?.id === id) {
        await updateDoc(doc(db, 'milestones', id), {
          state: 'SETTLED',
          updatedAt: serverTimestamp()
        });
        
        for (const file of files) {
          await updateDoc(doc(db, 'files', file.id), {
            accessState: 'SETTLED'
          });
        }
      }
      setMilestone(prev => prev ? { ...prev, state: 'SETTLED' } : null);
      setFiles(prev => prev.map(f => ({ ...f, accessState: 'SETTLED' })));

    } catch(e) {
      console.error(e);
      alert('Error approving deliverable');
    } finally {
      setIsApproving(false);
    }
  };


  const handleFileDispute = async () => {
    if (!milestone || !disputeReason.trim()) return;
    setIsFilingDispute(true);
    try {
      const ref = await addDoc(collection(db, 'disputes'), {
        milestoneId: milestone.id,
        projectId: milestone.projectId,
        category: 'Delivery Quality',
        description: disputeReason.trim(),
        status: 'OPEN',
        filedBy: 'client',
        createdAt: new Date(),
        auditLog: [{ action: 'Dispute Filed', notes: disputeReason.trim(), timestamp: new Date() }],
      });
      setIsDisputeModalOpen(false);
      setDisputeReason('');
      router.push(`/disputes/${ref.id}`);
    } catch (e) {
      console.error(e);
      alert('Error filing dispute');
    } finally {
      setIsFilingDispute(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) return;
    setIsRequestingRevision(true);
    try {
      const newUsed = (milestone?.revisionUsed || 0) + 1;
      if (id && id !== '1') {
        await updateDoc(doc(db, 'milestones', id), {
          state: 'REVISION_REQUESTED',
          revisionUsed: newUsed,
          revisionNotes: revisionNotes,
          updatedAt: serverTimestamp()
        });
      }
      setMilestone(prev => prev ? { ...prev, state: 'REVISION_REQUESTED', revisionUsed: newUsed } : null);

      setIsRevisionModalOpen(false);
      setRevisionNotes('');
    } catch (e) {
       console.error(e);
       alert('Error requesting revision');
    } finally {
       setIsRequestingRevision(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-[#8B8680]">Loading deliverables...</div>;
  if (!milestone) return <div className="text-center py-12 text-[#8B8680]">Milestone not found</div>;

  const isLocked = milestone.state === 'DELIVERED';
  const revisionUsed = milestone.revisionUsed || 0;
  const revisionLimit = milestone.revisionLimit || 2;

  const displayFile = files[0];

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-12 p-8 max-w-7xl mx-auto">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             {displayFile?.fileName?.includes('mp4') ? <FileVideo className="w-8 h-8 text-[#1C1C1C]" /> : <FileImage className="w-8 h-8 text-[#1C1C1C]" />}
             <div>
               <h1 className="text-2xl font-bold text-[#1C1C1C] truncate max-w-[200px] md:max-w-md">{displayFile?.fileName}</h1>
               <div className="text-sm text-[#8B8680]">Milestone: {milestone.title}</div>
             </div>
          </div>
          {isLocked ? (
             <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-yellow-100 text-yellow-800 animate-pulse shrink-0">
               <Lock className="w-3 h-3" /> Preview Locked
             </div>
          ) : (
             <div className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-green-100 text-green-800 shrink-0">
               Unlocked
             </div>
          )}
        </div>

        <div className="relative w-full aspect-video bg-[#EAE6DF] rounded-2xl border border-[#D4CFCA] overflow-hidden flex items-center justify-center">
          {displayFile?.fileName?.includes('mp4') ? (
            <video 
              src={displayFile.previewUrl} 
              autoPlay
              muted
              loop
              className={`w-full h-full object-cover transition-all duration-500 ${isLocked ? 'opacity-80 blur-[2px] grayscale-[50%]' : 'opacity-100'}`}
            />
          ) : (
            <img 
               src={displayFile?.previewUrl || "https://picsum.photos/seed/branding/800/600"} 
               alt="Preview"
               className={`w-full h-full object-cover transition-all duration-500 ${isLocked ? 'opacity-80 blur-[2px] grayscale-[50%]' : 'opacity-100'}`}
               referrerPolicy="no-referrer"
            />
          )}
          
          {isLocked && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/10">
               <div className="transform -rotate-12 bg-red-600 text-white font-black text-4xl md:text-6xl tracking-widest py-2 px-8 border-4 border-red-600 opacity-80 mix-blend-multiply">
                 UNPAID PREVIEW
               </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#D4CFCA]">
          <h3 className="text-sm font-bold text-[#1C1C1C] uppercase tracking-wider mb-2">Delivery Notes</h3>
          <p className="text-sm text-[#1C1C1C]">{milestone.deliveryNotes || 'No notes provided.'}</p>
        </div>
      </div>

      <div className="w-full md:w-80 shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-[#D4CFCA] shadow-sm space-y-6">
          {isLocked ? (
            <>
              <div className="text-center space-y-2 mb-4">
                <h3 className="font-bold text-[#1C1C1C] text-lg">Approve & Release Funds</h3>
                <p className="text-sm text-[#8B8680]">Approving will release the ${milestone.amount} escrow to the freelancer.</p>
              </div>
              <div className="space-y-3">
                <Button className="w-full gap-2" size="lg" onClick={handleApprove} disabled={isApproving}>
                  <ThumbsUp className="w-4 h-4" /> {isApproving ? 'Approving...' : 'Approve Deliverable'}
                </Button>
                
                {revisionUsed < revisionLimit ? (
                  <Button variant="secondary" className="w-full gap-2 text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setIsRevisionModalOpen(true)}>
                    <HelpCircle className="w-4 h-4" /> Request Revision
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    className="w-full gap-2 text-[#1C1C1C] border-[#1C1C1C] bg-white hover:bg-[#F5F2ED]"
                    onClick={() => setIsCOModalOpen(true)}
                  >
                    <PlusCircle className="w-4 h-4" /> Request Paid Revision
                  </Button>
                )}
                
                <Button variant="tertiary" className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setIsDisputeModalOpen(true)}>
                  <AlertOctagon className="w-4 h-4" /> File Dispute
                </Button>
              </div>

              <div className="pt-4 border-t border-[#D4CFCA]">
                 <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-wider">
                   <div className="flex items-center gap-1.5">
                     <History className="w-3 h-3 text-[#8B8680]" />
                     <span className="text-[#1C1C1C]">Revision Budget</span>
                   </div>
                   <span className={revisionUsed >= revisionLimit ? 'text-red-600' : 'text-[#8B8680]'}>
                     {revisionUsed} / {revisionLimit} Used
                   </span>
                 </div>
                 <div className="flex gap-1 h-1.5">
                   {Array.from({ length: Math.max(revisionLimit, revisionUsed) }).map((_, i) => (
                     <div 
                      key={i} 
                      className={`flex-1 rounded-full ${
                        i < revisionUsed 
                        ? (i < revisionLimit ? 'bg-orange-500' : 'bg-red-600') 
                        : 'bg-[#EAE6DF]'
                      }`} 
                     />
                   ))}
                 </div>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <h3 className="font-bold text-green-600 text-lg">
                {milestone.state === 'REVISION_REQUESTED' ? 'Revision Requested' : 'Funds Released'}
              </h3>
              {milestone.state === 'SETTLED' && files.map(f => (
                <Button key={f.id} className="w-full gap-2" size="lg" onClick={() => window.open(f.previewUrl, '_blank')}>
                  <Download className="w-4 h-4" /> Download Files
                </Button>
              ))}
              <Button variant="secondary" className="w-full" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      {isRevisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Request Revision</h2>
            <p className="text-sm text-[#8B8680] mb-4">You have {(revisionLimit || 2) - revisionUsed} standard revisions remaining.</p>
            <textarea
               className="w-full min-h-[120px] border border-[#D4CFCA] rounded-xl p-3 focus:ring-2 focus:ring-[#1C1C1C] outline-none text-sm resize-none mb-4"
               placeholder="Detailed feedback..."
               value={revisionNotes}
               onChange={e => setRevisionNotes(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
               <Button variant="secondary" onClick={() => setIsRevisionModalOpen(false)}>Cancel</Button>
               <Button onClick={handleRequestRevision} disabled={isRequestingRevision || !revisionNotes.trim()}>
                 {isRequestingRevision ? 'Submitting...' : 'Submit Revision'}
               </Button>
            </div>
          </div>
        </div>
      )}

      {isDisputeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-3">File Dispute</h2>
            <textarea
              className="w-full min-h-[120px] border border-[#D4CFCA] rounded-xl p-3 focus:ring-2 focus:ring-[#1C1C1C] outline-none text-sm resize-none mb-4"
              placeholder="Describe the issue and attach evidence in chat/files..."
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setIsDisputeModalOpen(false)}>Cancel</Button>
              <Button onClick={handleFileDispute} disabled={isFilingDispute || !disputeReason.trim()}>
                {isFilingDispute ? 'Submitting...' : 'Submit Dispute'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ChangeOrderModal 
        isOpen={isCOModalOpen}
        onClose={() => setIsCOModalOpen(false)}
        projectId={milestone.projectId}
        milestoneId={milestone.id}
        initialType="paid_revision"
      />
    </div>
  );
}
