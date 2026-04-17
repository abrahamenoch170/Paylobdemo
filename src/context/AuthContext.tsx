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
import { auth, db, googleProvider, githubProvider } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: (FirebaseUser & Partial<User>) | null;
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
  const [user, setUser] = useState<(FirebaseUser & Partial<User>) | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to sync firestore data
  const syncUserData = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      setUser(Object.assign({}, firebaseUser, userSnap.data()));
    } else {
      // Create new user doc
      const newUser: Partial<User> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        photoURL: firebaseUser.photoURL || undefined,
        role: null,
        onboardingComplete: false,
        createdAt: new Date()
      };
      await setDoc(userRef, newUser);
      setUser(Object.assign({}, firebaseUser, newUser));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        await syncUserData(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
    // User doc is created via onAuthStateChanged
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
    // Apple provider requires extra config in Firebase console
    console.warn("Apple sign in not fully configured, falling back to Google");
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, signUp, signIn, signOut, signInWithGoogle, signInWithGitHub, signInWithApple
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
