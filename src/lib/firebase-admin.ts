import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  // Check if we have credentials in env, if so use them, otherwise applicationDefault
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
