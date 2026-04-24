import { Timestamp } from 'firebase/firestore';

export type MilestoneState =
  | 'DRAFT'
  | 'SIGNED'
  | 'FUNDED'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'REVISION_REQUESTED'
  | 'SETTLED'
  | 'DISPUTED';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  state: MilestoneState;
  acceptanceCriteria: string;
  revisionLimit: number;
  revisionUsed: number;
  deliveryNotes?: string;
  deliverables?: string[];
  dueDate: Timestamp | Date;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface FileRecord {
  id: string;
  milestoneId: string;
  projectId: string;
  name: string;
  fileName: string;
  url: string;
  previewUrl: string;
  size: number;
  type: string;
  storagePath: string;
  uploadedBy: string;
  hash: string;
  accessState: string;
  encrypted: boolean;
  createdAt: Timestamp | Date;
  uploadedAt: Timestamp | Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  totalAmount: number;
  freelancerId: string;
  clientId?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'freelancer' | 'client' | null;
  onboardingComplete: boolean;
  createdAt: Date | Timestamp;
}
