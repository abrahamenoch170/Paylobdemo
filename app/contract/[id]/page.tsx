"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/auth-modal';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ContractPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSigned, setIsSigned] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, 'projects', id as string));
        if (snap.exists()) {
          const data = snap.data();
          setProject(data);
          if (data.status !== 'DRAFT') {
            setIsSigned(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleSign = async () => {
    try {
      await updateDoc(doc(db, 'projects', id as string), {
        status: 'ACTIVE',
        signedAt: new Date()
      });
      setIsSigned(true);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-20 text-center text-[#8B8680]">Loading contract...</div>;
  if (!project) return <div className="p-20 text-center text-[#8B8680]">Contract not found.</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8 bg-white p-8 md:p-12 rounded-2xl border border-[#D4CFCA]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#1C1C1C]">Service Agreement</h1>
          <div className="px-3 py-1 bg-[#F5F2ED] rounded-full text-xs font-bold text-[#8B8680]">
            ID: {id?.toString().slice(0, 8)}
          </div>
        </div>

        <div className="space-y-6 text-[#1C1C1C] leading-relaxed">
          <p>This Service Agreement ("Agreement") is entered into as of the date of electronic signature by and between the service provider ("Freelancer") and the service recipient ("Client").</p>
          
          <div>
            <h3 className="text-lg font-bold mb-2">1. Scope of Work</h3>
            <p>{project.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">2. Compensation</h3>
            <p>The Client agrees to pay the Freelancer a total of <strong>${project.totalAmount}</strong> for the successful completion of all milestones defined in this project.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">3. Delivery & Escrow</h3>
            <p>Payment shall be authorized and held in escrow before work begins. Release of funds is contingent upon the Client's approval of deliverables or the expiration of the dispute window.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">4. IP Rights</h3>
            <p>Ownership of all deliverables and associated intellectual property shall transfer to the Client only upon successful settlement of the final payment milestone.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-[#D4CFCA] rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-[#1C1C1C]">Terms Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#8B8680]">Total Value</span>
              <span className="font-bold text-[#1C1C1C]">${project.totalAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#8B8680]">Deposit Required</span>
              <span className="text-[#1C1C1C]">100% Escrow Authorization</span>
            </div>
          </div>

          <div className="p-4 bg-[#F5F2ED] rounded-xl flex items-center gap-3 border border-[#D4CFCA]">
            <ShieldCheck className="w-5 h-5 text-[#1C1C1C]" />
            <div className="text-[10px] leading-tight text-[#8B8680]">
              PAYLOB SECURE™: Your payment is only released when you receive and approve the work.
            </div>
          </div>

          {isSigned ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-sm">Contract Signed</span>
              </div>
              {!user && (
                <Button variant="secondary" className="w-full" onClick={() => setAuthModalOpen(true)}>
                  Login to see updates
                </Button>
              )}
              <Button className="w-full group" onClick={() => router.push(`/dashboard`)}>
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          ) : (
            <Button className="w-full h-12 text-lg" onClick={handleSign}>
              Review & Sign
            </Button>
          )}
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
