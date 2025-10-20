// Centralized Firebase initialization and service access
// This is the single source of truth for all Firebase instances
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth as getAuthClient, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreClient, Firestore } from 'firebase/firestore';
import { getDatabase as getDatabaseClient, Database } from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Single app instance (singleton pattern)
// Initialize ONCE on client side only (avoid SSR issues)
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;
let rtdb: Database | undefined;

if (typeof window !== 'undefined') {
  // Only initialize on client side
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  // Initialize all Firebase services
  auth = getAuthClient(app);
  firestore = getFirestoreClient(app);
  rtdb = getDatabaseClient(app);
}

// Export instances (can be undefined during SSR)
export { app, auth, firestore, rtdb };

/**
 * Helper function to safely access Firebase App with error handling
 * @throws {Error} If Firebase App not initialized (SSR or initialization failed)
 */
export function getApp(): FirebaseApp {
  if (!app) {
    throw new Error('Firebase App not initialized. This should only be called on the client side.');
  }
  return app;
}

/**
 * Helper function to safely access Firebase Auth with error handling
 * @throws {Error} If Firebase Auth not initialized (SSR or initialization failed)
 */
export function getAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth not initialized. This should only be called on the client side.');
  }
  return auth;
}

/**
 * Helper function to safely access Firestore with error handling
 * @throws {Error} If Firestore not initialized (SSR or initialization failed)
 */
export function getFirestore(): Firestore {
  if (!firestore) {
    throw new Error('Firestore not initialized. This should only be called on the client side.');
  }
  return firestore;
}

/**
 * Helper function to safely access Firebase Realtime Database with error handling
 * @throws {Error} If RTDB not initialized (SSR or initialization failed)
 */
export function getRTDB(): Database {
  if (!rtdb) {
    throw new Error('Firebase RTDB not initialized. This should only be called on the client side.');
  }
  return rtdb;
}

/**
 * Alias for getFirestore() - used by Lookbooks feature for compatibility
 * Provides consistent naming with legacy getDb() pattern
 */
export const getDb = getFirestore;

