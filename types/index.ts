import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  role: 'freelancer' | 'client';
  onboardingComplete: boolean;
  displayName?: string;
  photoURL?: string;
}

export interface Project {
  id: string;
  clientId: string;
  freelancerId: string;
  title: string;
  description: string;
  totalAmount: number;
  status: 'DRAFT' | 'ACTIVE' | 'SETTLED' | 'DISPUTED';
  createdAt: Timestamp;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Timestamp;
  state: 'AUTHORIZED' | 'HELD' | 'DELIVERED' | 'REVISION_REQUESTED' | 'SETTLED';
}

export interface Contract {
  id: string;
  projectId: string;
  signers: Array<{ 
    email: string; 
    name: string; 
    order: number; 
    status: 'pending' | 'viewed' | 'signed' | 'declined'; 
    signedAt?: Timestamp 
  }>;
  expiresAt: Timestamp;
  reminderSchedule: Array<'24h' | '3d' | '7d'>;
  status: 'DRAFT' | 'SIGNED' | 'EXPIRED';
}

export interface FileRecord {
  id: string;
  projectId: string;
  milestoneId: string;
  name: string;
  url: string;
  encrypted: boolean;
  hash: string;
}

export interface Payment {
  id: string;
  projectId: string;
  milestoneId: string;
  amount: number;
  provider: 'flutterwave' | 'paystack';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
}

export interface Dispute {
  id: string;
  projectId: string;
  milestoneId: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface ChangeOrder {
  id: string;
  projectId: string;
  description: string;
  amount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  timestamp: Timestamp;
}
