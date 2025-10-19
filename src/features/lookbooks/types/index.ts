import { Timestamp } from 'firebase/firestore';

/**
 * Role types for collaboration (Feature 9)
 */
export type Role = 'owner' | 'designer';

/**
 * Collaborator entity (Feature 9)
 */
export interface Collaborator {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: Role;
  addedAt: Timestamp;
}

/**
 * Lookbook entity (called "canvases" in backend, "Lookbooks" in UI)
 */
export interface Lookbook {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail?: string; // Data URL or storage URL
  // Feature 9: Collaboration metadata (populated on fetch)
  collaborators?: Collaborator[];
  currentUserRole?: Role;
}

/**
 * User's canvas index entry
 */
export interface UserCanvasIndex {
  role: Role; // Feature 9: 'owner' | 'designer'
  lastOpened: Timestamp;
}

/**
 * Lookbook creation data
 */
export interface CreateLookbookData {
  name: string;
  ownerId: string;
}

/**
 * Lookbook update data
 */
export interface UpdateLookbookData {
  name?: string;
  updatedAt?: Timestamp;
  thumbnail?: string;
}

/**
 * User directory entry for search (Feature 9)
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

