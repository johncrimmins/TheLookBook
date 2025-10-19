import { Timestamp } from 'firebase/firestore';

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
}

/**
 * User's canvas index entry
 */
export interface UserCanvasIndex {
  role: 'owner'; // Future: 'designer' for Feature 9
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

