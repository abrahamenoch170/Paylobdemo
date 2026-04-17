"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider } from '@/lib/firebase';

interface AuthContextType {
  user: (FirebaseUser & { role?: "client" | "freelancer" | "admin" | null; onboardingComplete?: boolean }) | null;
  loading: boolean;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(FirebaseUser & { role?: "client" | "freelancer" | "admin" | null; onboardingComplete?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserData = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      setUser(Object.assign({}, firebaseUser, userSnap.data()));
    } else {
      const newUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        role: null,
        onboardingComplete: false,
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newUser);
      setUser(Object.assign({}, firebaseUser, newUser));
    }
  };


  const setSessionCookie = async (firebaseUser: FirebaseUser | null) => {
    if (typeof document === 'undefined') return;
    if (!firebaseUser) {
      document.cookie = 'firebaseIdToken=; Path=/; Max-Age=0; SameSite=Lax';
      return;
    }

    const token = await firebaseUser.getIdToken();
    document.cookie = `firebaseIdToken=${encodeURIComponent(token)}; Path=/; Max-Age=3600; SameSite=Lax`;
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await syncUserData(firebaseUser);
        await setSessionCookie(firebaseUser);
      } else {
        setUser(null);
        await setSessionCookie(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
  };

  const signIn = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signInWithGitHub = async () => {
    await signInWithPopup(auth, githubProvider);
  };

  const signInWithApple = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, signUp, signIn, signOut, signInWithGoogle, signInWithGitHub, signInWithApple
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
