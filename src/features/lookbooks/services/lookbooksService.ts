import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  writeBatch,
  getFirestore,
} from 'firebase/firestore';
import { getApp } from '@/features/auth/lib/firebase';
import { Lookbook, CreateLookbookData, UpdateLookbookData, UserCanvasIndex } from '../types';

// Get Firestore instance (will only work on client side)
function getDb() {
  return getFirestore(getApp());
}

/**
 * Create a new Lookbook
 */
export async function createLookbook(
  data: CreateLookbookData,
  userEmail?: string,
  userDisplayName?: string,
  userPhotoURL?: string
): Promise<Lookbook> {
  const db = getDb();
  const canvasRef = doc(collection(db, 'canvases'));
  const now = Timestamp.now();

  const lookbook: Lookbook = {
    id: canvasRef.id,
    name: data.name,
    ownerId: data.ownerId,
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(db);

  // Create canvas document
  batch.set(canvasRef, lookbook);

  // Create user index entry
  const userCanvasRef = doc(db, `users/${data.ownerId}/canvases/${canvasRef.id}`);
  const userIndex: UserCanvasIndex = {
    role: 'owner',
    lastOpened: now,
  };
  batch.set(userCanvasRef, userIndex);

  // Feature 9: Create owner collaborator entry
  const collaboratorRef = doc(db, `canvases/${canvasRef.id}/collaborators/${data.ownerId}`);
  batch.set(collaboratorRef, {
    email: userEmail || '',
    displayName: userDisplayName,
    photoURL: userPhotoURL,
    role: 'owner',
    addedAt: now,
  });

  await batch.commit();

  return lookbook;
}

/**
 * Get a Lookbook by ID
 */
export async function getLookbook(canvasId: string): Promise<Lookbook | null> {
  const db = getDb();
  const docRef = doc(db, 'canvases', canvasId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as Lookbook;
}

/**
 * Get all Lookbooks for a user
 */
export async function getUserLookbooks(userId: string): Promise<Lookbook[]> {
  const db = getDb();
  // Query user index
  const userCanvasesRef = collection(db, `users/${userId}/canvases`);
  const userCanvasesSnap = await getDocs(userCanvasesRef);

  // Fetch canvas metadata for each
  const lookbooksPromises = userCanvasesSnap.docs.map(async (userCanvasDoc) => {
    const canvasId = userCanvasDoc.id;
    return getLookbook(canvasId);
  });

  const lookbooks = await Promise.all(lookbooksPromises);
  
  // Filter out nulls and sort by updatedAt
  return lookbooks
    .filter((lb): lb is Lookbook => lb !== null)
    .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
}

/**
 * Subscribe to user's Lookbooks
 */
export function subscribeToUserLookbooks(
  userId: string,
  callback: (lookbooks: Lookbook[]) => void,
  onError?: (error: Error) => void
): () => void {
  const db = getDb();
  const userCanvasesRef = collection(db, `users/${userId}/canvases`);

  return onSnapshot(
    userCanvasesRef,
    async (snapshot) => {
      try {
        // If no documents, return empty array immediately
        if (snapshot.docs.length === 0) {
          callback([]);
          return;
        }

        // Fetch full canvas metadata for each
        const lookbooksPromises = snapshot.docs.map(async (userCanvasDoc) => {
          const canvasId = userCanvasDoc.id;
          return getLookbook(canvasId);
        });

        const lookbooks = await Promise.all(lookbooksPromises);
        const validLookbooks = lookbooks
          .filter((lb): lb is Lookbook => lb !== null)
          .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);

        callback(validLookbooks);
      } catch (error) {
        console.error('Error loading Lookbooks:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    },
    (error) => {
      console.error('Lookbooks subscription error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Subscribe to user's Lookbooks filtered by role (Feature 9)
 */
export function subscribeToUserLookbooksByRole(
  userId: string,
  role: 'owner' | 'designer',
  callback: (lookbooks: Lookbook[]) => void,
  onError?: (error: Error) => void
): () => void {
  const db = getDb();
  const userCanvasesRef = collection(db, `users/${userId}/canvases`);
  const roleQuery = query(userCanvasesRef, where('role', '==', role));

  return onSnapshot(
    roleQuery,
    async (snapshot) => {
      try {
        if (snapshot.docs.length === 0) {
          callback([]);
          return;
        }

        // Fetch full canvas metadata for each
        const lookbooksPromises = snapshot.docs.map(async (userCanvasDoc) => {
          const canvasId = userCanvasDoc.id;
          return getLookbook(canvasId);
        });

        const lookbooks = await Promise.all(lookbooksPromises);
        const validLookbooks = lookbooks
          .filter((lb): lb is Lookbook => lb !== null)
          .sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);

        callback(validLookbooks);
      } catch (error) {
        console.error('Error loading Lookbooks by role:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    },
    (error) => {
      console.error('Lookbooks subscription error:', error);
      if (onError) {
        onError(error);
      }
    }
  );
}

/**
 * Subscribe to a single Lookbook's metadata
 */
export function subscribeToLookbook(
  canvasId: string,
  callback: (lookbook: Lookbook | null) => void
): () => void {
  const db = getDb();
  const docRef = doc(db, 'canvases', canvasId);

  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(snapshot.data() as Lookbook);
  });
}

/**
 * Update a Lookbook
 */
export async function updateLookbook(
  canvasId: string,
  updates: UpdateLookbookData
): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'canvases', canvasId);
  
  const updateData = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

  await updateDoc(docRef, updateData);
}

/**
 * Rename a Lookbook
 */
export async function renameLookbook(
  canvasId: string,
  newName: string
): Promise<void> {
  await updateLookbook(canvasId, { name: newName });
}

/**
 * Update Lookbook thumbnail
 */
export async function updateLookbookThumbnail(
  canvasId: string,
  thumbnail: string
): Promise<void> {
  await updateLookbook(canvasId, { thumbnail });
}

/**
 * Update Lookbook's updatedAt timestamp
 */
export async function touchLookbook(canvasId: string): Promise<void> {
  const db = getDb();
  const docRef = doc(db, 'canvases', canvasId);
  await updateDoc(docRef, { updatedAt: Timestamp.now() });
}

/**
 * Delete a Lookbook and all its data
 */
export async function deleteLookbook(
  canvasId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);

  // Delete canvas document
  const canvasRef = doc(db, 'canvases', canvasId);
  batch.delete(canvasRef);

  // Delete user index entry
  const userCanvasRef = doc(db, `users/${userId}/canvases/${canvasId}`);
  batch.delete(userCanvasRef);

  // Note: Subcollections (objects, layers) need to be deleted separately
  // due to Firestore limitations with batch operations
  await batch.commit();

  // Delete subcollections
  await deleteSubcollection(canvasId, 'objects');
  await deleteSubcollection(canvasId, 'layers');
}

/**
 * Helper: Delete a subcollection
 */
async function deleteSubcollection(
  canvasId: string,
  subcollectionName: string
): Promise<void> {
  const db = getDb();
  const subcollectionRef = collection(db, `canvases/${canvasId}/${subcollectionName}`);
  const snapshot = await getDocs(subcollectionRef);

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  if (snapshot.docs.length > 0) {
    await batch.commit();
  }
}

/**
 * Check if a Lookbook name exists for a user
 */
export async function lookbookNameExists(
  userId: string,
  name: string
): Promise<boolean> {
  const lookbooks = await getUserLookbooks(userId);
  return lookbooks.some((lb) => lb.name === name);
}

