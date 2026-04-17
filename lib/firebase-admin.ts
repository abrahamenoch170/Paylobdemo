import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

const app =
  getApps()[0] ??
  initializeApp({
    credential:
      projectId && clientEmail && privateKey
        ? cert({
            projectId,
            clientEmail,
            privateKey,
          })
        : applicationDefault(),
    ...(storageBucket ? { storageBucket } : {}),
  });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
