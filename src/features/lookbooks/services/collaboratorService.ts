import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getDb } from '@/shared/services/firebase';
import { Collaborator, UserProfile, Role } from '../types';

/**
 * Get all collaborators for a canvas
 */
export async function getCollaborators(canvasId: string): Promise<Collaborator[]> {
  const db = getDb();
  const collaboratorsRef = collection(db, `canvases/${canvasId}/collaborators`);
  const snapshot = await getDocs(collaboratorsRef);
  
  return snapshot.docs.map((doc) => ({
    userId: doc.id,
    ...doc.data(),
  } as Collaborator));
}

/**
 * Subscribe to collaborator changes
 */
export function subscribeToCollaborators(
  canvasId: string,
  callback: (collaborators: Collaborator[]) => void
): Unsubscribe {
  const db = getDb();
  const collaboratorsRef = collection(db, `canvases/${canvasId}/collaborators`);
  
  return onSnapshot(collaboratorsRef, (snapshot) => {
    const collaborators = snapshot.docs.map((doc) => ({
      userId: doc.id,
      ...doc.data(),
    } as Collaborator));
    callback(collaborators);
  });
}

/**
 * Add a designer to a canvas
 */
export async function addCollaborator(
  canvasId: string,
  userId: string,
  email: string,
  displayName?: string,
  photoURL?: string
): Promise<void> {
  const db = getDb();
  const now = Timestamp.now();
  
  const collaborator: Omit<Collaborator, 'userId'> = {
    email,
    displayName,
    photoURL,
    role: 'designer',
    addedAt: now,
  };
  
  // Create collaborator entry
  const collaboratorRef = doc(db, `canvases/${canvasId}/collaborators/${userId}`);
  await setDoc(collaboratorRef, collaborator);
  
  // Create user index entry
  const userCanvasRef = doc(db, `users/${userId}/canvases/${canvasId}`);
  await setDoc(userCanvasRef, {
    role: 'designer',
    lastOpened: now,
  });
}

/**
 * Remove a collaborator from a canvas
 */
export async function removeCollaborator(
  canvasId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  
  // Remove from collaborators subcollection
  const collaboratorRef = doc(db, `canvases/${canvasId}/collaborators/${userId}`);
  batch.delete(collaboratorRef);
  
  // Remove from user index
  const userCanvasRef = doc(db, `users/${userId}/canvases/${canvasId}`);
  batch.delete(userCanvasRef);
  
  await batch.commit();
}

/**
 * Transfer ownership of a canvas
 */
export async function transferOwnership(
  canvasId: string,
  currentOwnerId: string,
  newOwnerId: string
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  
  // Update collaborator roles
  const currentOwnerRef = doc(db, `canvases/${canvasId}/collaborators/${currentOwnerId}`);
  batch.update(currentOwnerRef, { role: 'designer' });
  
  const newOwnerRef = doc(db, `canvases/${canvasId}/collaborators/${newOwnerId}`);
  batch.update(newOwnerRef, { role: 'owner' });
  
  // Update user index entries
  const currentOwnerIndexRef = doc(db, `users/${currentOwnerId}/canvases/${canvasId}`);
  batch.update(currentOwnerIndexRef, { role: 'designer' });
  
  const newOwnerIndexRef = doc(db, `users/${newOwnerId}/canvases/${canvasId}`);
  batch.update(newOwnerIndexRef, { role: 'owner' });
  
  // Update canvas ownerId
  const canvasRef = doc(db, `canvases/${canvasId}`);
  batch.update(canvasRef, { ownerId: newOwnerId });
  
  await batch.commit();
}

/**
 * Search users by email or display name
 */
export async function searchUsers(
  searchTerm: string,
  excludeUserIds: string[] = []
): Promise<UserProfile[]> {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }
  
  const db = getDb();
  const usersRef = collection(db, 'users');
  const searchLower = searchTerm.toLowerCase();
  
  // Search by email (case-insensitive prefix match)
  const emailQuery = query(
    usersRef,
    where('email', '>=', searchLower),
    where('email', '<=', searchLower + '\uf8ff'),
    limit(10)
  );
  
  const emailSnapshot = await getDocs(emailQuery);
  const results = emailSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as UserProfile));
  
  // Filter out excluded users
  return results.filter((user) => !excludeUserIds.includes(user.id));
}

/**
 * Get user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const db = getDb();
  const userRef = doc(db, `users/${userId}`);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  return {
    id: userSnap.id,
    ...userSnap.data(),
  } as UserProfile;
}

/**
 * Check if user is owner of a canvas
 */
export async function isOwner(canvasId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const collaboratorRef = doc(db, `canvases/${canvasId}/collaborators/${userId}`);
  const collaboratorSnap = await getDoc(collaboratorRef);
  
  if (!collaboratorSnap.exists()) {
    return false;
  }
  
  return collaboratorSnap.data()?.role === 'owner';
}

/**
 * Check if user is a collaborator (owner or designer)
 */
export async function isCollaborator(canvasId: string, userId: string): Promise<boolean> {
  const db = getDb();
  const collaboratorRef = doc(db, `canvases/${canvasId}/collaborators/${userId}`);
  const collaboratorSnap = await getDoc(collaboratorRef);
  
  return collaboratorSnap.exists();
}

/**
 * Permission helper functions
 */
export const permissions = {
  canEditObjects: () => true, // Both owner and designer can edit
  canManageCollaborators: (role: Role) => role === 'owner',
  canDeleteLookbook: (role: Role) => role === 'owner',
  canTransferOwnership: (role: Role) => role === 'owner',
};

