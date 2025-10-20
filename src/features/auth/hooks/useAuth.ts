// Auth hook - manages authentication state
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/shared/services/firebase';
import { useAuthStore } from '../lib/authStore';
import { User } from '../types';
import { syncUserProfile } from '../services/authService';

/**
 * Hook to manage authentication state
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  useEffect(() => {
    if (!auth) {
      console.warn('[Auth] Firebase auth not initialized');
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
          photoURL: firebaseUser.photoURL,
        };
        setUser(user);
        
        // Feature 9: Sync user profile to Firestore for user search
        await syncUserProfile(
          firebaseUser.uid,
          firebaseUser.email || '',
          firebaseUser.displayName,
          firebaseUser.photoURL
        );
      } else {
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, [setUser]);
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: false, // You can add loading state if needed
  };
}

