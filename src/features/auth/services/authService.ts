// Auth service - handles Firebase authentication
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, getApp, getFirestore } from '@/shared/services/firebase';
import { AuthFormData } from '../types';

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: AuthFormData): Promise<void> {
  const { email, password, displayName } = data;
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const auth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update display name if provided
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, {
      displayName,
    });
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(data: AuthFormData): Promise<void> {
  const { email, password } = data;
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const auth = getAuth();
  await firebaseSignOut(auth);
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<void> {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

/**
 * Sync user profile to Firestore (Feature 9)
 * Called when user signs in/up to ensure user directory is populated for search
 */
export async function syncUserProfile(
  userId: string,
  email: string,
  displayName?: string | null,
  photoURL?: string | null
): Promise<void> {
  try {
    console.log('[Auth] Syncing user profile:', { userId, email, displayName });
    const db = getFirestore();
    const userRef = doc(db, `users/${userId}`);
    
    await setDoc(
      userRef,
      {
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || null,
      },
      { merge: true } // Merge to avoid overwriting other fields
    );
    console.log('[Auth] User profile synced successfully:', userId);
  } catch (error) {
    console.error('[Auth] Failed to sync user profile:', {
      userId,
      email,
      error: error instanceof Error ? error.message : error,
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined
    });
    // Don't throw - this is a non-critical operation
  }
}

