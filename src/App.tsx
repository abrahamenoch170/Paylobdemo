/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ResponsiveLayout } from '@/src/components/layout/responsive-layout';
import { PublicLayout } from '@/src/components/layout/public-layout';
import { Button } from '@/src/components/ui/button';
import { AuthModal } from '@/src/components/auth/auth-modal';
import { Lock } from 'lucide-react';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';

import DashboardPage from '@/src/app/dashboard/page';
import ProjectsPage from '@/src/app/projects/page';
import MilestonesPage from '@/src/app/milestones/page';
import DeliverablesPage from '@/src/app/deliverables/page';
import RateCardPage from '@/src/app/rate-card/page';
import ContractsPage from '@/src/app/contracts/page';
import PaymentsPage from '@/src/app/payments/page';
import DocumentsPage from '@/src/app/documents/page';
import IntegrationsPage from '@/src/app/settings/integrations/page';
import ProfileSettingsPage from '@/src/app/settings/profile/page';
import SecuritySettingsPage from '@/src/app/settings/security/page';
import PayoutSettingsPage from '@/src/app/settings/payout/page';
import NotificationSettingsPage from '@/src/app/settings/notifications/page';
import AISettingsPage from '@/src/app/settings/ai/page';
import LegalSettingsPage from '@/src/app/settings/legal/page';

// New Pages
import ContractReviewPage from '@/src/app/contract/page';
import PaymentPage from '@/src/app/pay/page';
import PaymentVerifyPage from '@/src/app/pay/verify/page';
import NewProjectPage from '@/src/app/projects/new/page';
import ProjectDetailPage from '@/src/app/projects/[id]/page';
import DeliverableReviewPage from '@/src/app/deliver/page';
import MilestoneDetailPage from '@/src/app/milestones/[id]/page';
import DisputeDetailPage from '@/src/app/disputes/page';
import ChangeOrderResponsePage from '@/src/app/change-order/page';
import PublicFreelancerProfile from '@/src/app/freelancer/[uid]/page';
import DeliverableCertificatePage from '@/src/app/deliverables/certificate/page';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Could also check onboardingComplete here: 
  // if (!user.onboardingComplete) return <Navigate to="/role" replace />;
  
  return <>{children}</>;
}

function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const openAuth = (mode: 'login' | 'signup') => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F2ED] font-sans">
        
        {/* Left Zone - Desktop 60%, Mobile 40vh */}
        <div className="w-full md:w-[60%] h-[40vh] md:h-screen flex flex-col relative p-8 md:p-16">
          <div className="text-xl font-bold text-[#1C1C1C]">
            PAYLOB
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto z-10 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1C1C1C]">
              Delivery-controlled payments for digital work
            </h1>
            <p className="text-lg text-[#8B8680]">
              PAYLOB protects freelancers by enforcing delivery-payment linkage. No chasing invoices, no getting burned.
            </p>
          </div>

          {/* Minimal geometric illustration placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none hidden md:flex">
            <div className="w-96 h-96 border-[4px] border-[#1C1C1C] rounded-[48px] rotate-12 flex items-center justify-center">
               <Lock className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Right Zone - Desktop 40%, Mobile rest */}
        <div className="w-full md:w-[40%] flex-1 md:h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-8 md:p-16 shadow-2xl z-20">
          <div className="w-full max-w-sm space-y-8 text-center">
            <div className="text-xl font-bold text-[#1C1C1C] md:hidden mb-12">
              PAYLOB
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#1C1C1C]">Get Started</h2>
              <div className="flex flex-col gap-3">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={() => openAuth('signup')}
                >
                  Create account
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => openAuth('login')}
                >
                  Sign in
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-[#8B8680] mt-12">
              A project from detova labs &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialMode={modalMode} 
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Routes (No Navigation) */}
          <Route path="/contract/:id" element={
            <PublicLayout>
              <ContractReviewPage />
            </PublicLayout>
          } />
          <Route path="/pay/:id" element={
            <PublicLayout>
              <PaymentPage />
            </PublicLayout>
          } />
          <Route path="/pay/verify" element={
            <PublicLayout>
              <PaymentVerifyPage />
            </PublicLayout>
          } />
          <Route path="/deliver/:id" element={
            <PublicLayout>
              <DeliverableReviewPage />
            </PublicLayout>
          } />
          <Route path="/freelancer/:uid" element={
            <PublicLayout>
              <PublicFreelancerProfile />
            </PublicLayout>
          } />
          <Route path="/change-order/:id" element={
            <PublicLayout>
              <ChangeOrderResponsePage />
            </PublicLayout>
          } />

          {/* Authenticated Routes (With Navigation) */}
          <Route path="/*" element={
            <RequireAuth>
              <ResponsiveLayout>
                <Routes>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/new" element={<NewProjectPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/milestones" element={<MilestonesPage />} />
                  <Route path="/milestones/:id" element={<MilestoneDetailPage />} />
                  <Route path="/disputes/:id" element={<DisputeDetailPage />} />
                  <Route path="/deliverables" element={<DeliverablesPage />} />
                  <Route path="/deliverables/certificate/:id" element={<DeliverableCertificatePage />} />
                  <Route path="/rate-card" element={<RateCardPage />} />
                  <Route path="/contracts" element={<ContractsPage />} />
                  <Route path="/payments" element={<PaymentsPage />} />
                  <Route path="/documents" element={<DocumentsPage />} />
                  <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
                  <Route path="/settings/profile" element={<ProfileSettingsPage />} />
                  <Route path="/settings/security" element={<SecuritySettingsPage />} />
                  <Route path="/settings/payout" element={<PayoutSettingsPage />} />
                  <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
                  <Route path="/settings/integrations" element={<IntegrationsPage />} />
                  <Route path="/settings/ai" element={<AISettingsPage />} />
                  <Route path="/settings/legal" element={<LegalSettingsPage />} />
                  
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </ResponsiveLayout>
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
