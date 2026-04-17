import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'paylob-app',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  } catch (e) {
    console.error('Firebase Admin initialization error:', e);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
