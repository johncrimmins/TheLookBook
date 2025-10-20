// Objects service - handles object persistence and real-time sync
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { ref, set, onValue, remove } from 'firebase/database';
import { getFirestore, getRTDB } from '@/shared/services/firebase';
import { CanvasObject, ObjectUpdate, ShapePreview, Layer, DEFAULT_LAYER_ID, DEFAULT_LAYER_NAME } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a new object and persist to Firestore
 */
export async function createObject(
  canvasId: string,
  object: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'>
): Promise<CanvasObject> {
  const id = uuidv4();
  const now = Date.now();
  
  const newObject: CanvasObject = {
    ...object,
    id,
    createdAt: now,
    updatedAt: now,
  };
  
  // Persist to Firestore
  const db = getFirestore();
  const objectRef = doc(db, 'canvases', canvasId, 'objects', id);
  await setDoc(objectRef, newObject);
  
  // Broadcast creation via RTDB
  await broadcastObjectUpdate(canvasId, {
    id,
    updates: newObject,
    timestamp: now,
  });
  
  return newObject;
}

/**
 * Update an existing object
 */
export async function updateObject(
  canvasId: string,
  objectId: string,
  updates: Partial<CanvasObject>
): Promise<void> {
  const now = Date.now();
  const db = getFirestore();
  const objectRef = doc(db, 'canvases', canvasId, 'objects', objectId);
  
  // Update in Firestore
  await updateDoc(objectRef, {
    ...updates,
    updatedAt: now,
  });
  
  // Broadcast update via RTDB
  await broadcastObjectUpdate(canvasId, {
    id: objectId,
    updates: { ...updates, updatedAt: now },
    timestamp: now,
  });
}

/**
 * Delete an object
 */
export async function deleteObject(canvasId: string, objectId: string): Promise<void> {
  const db = getFirestore();
  const rtdb = getRTDB();
  const objectRef = doc(db, 'canvases', canvasId, 'objects', objectId);
  await deleteDoc(objectRef);
  
  // Broadcast deletion via RTDB
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    deleted: true,
    timestamp: Date.now(),
  });
}

/**
 * Get all objects for a canvas
 */
export async function getCanvasObjects(canvasId: string): Promise<CanvasObject[]> {
  const db = getFirestore();
  const objectsRef = collection(db, 'canvases', canvasId, 'objects');
  const snapshot = await getDocs(objectsRef);
  
  return snapshot.docs.map((doc) => doc.data() as CanvasObject);
}

/**
 * Get a single object
 */
export async function getObject(canvasId: string, objectId: string): Promise<CanvasObject | null> {
  const db = getFirestore();
  const objectRef = doc(db, 'canvases', canvasId, 'objects', objectId);
  const snapshot = await getDoc(objectRef);
  
  if (!snapshot.exists()) return null;
  
  return snapshot.data() as CanvasObject;
}

/**
 * Broadcast object update via RTDB (for real-time sync)
 */
export async function broadcastObjectUpdate(canvasId: string, update: ObjectUpdate): Promise<void> {
  const rtdb = getRTDB();
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${update.id}`);
  await set(deltaRef, update);
  
  // Clear delta after a short delay (it's already in Firestore)
  setTimeout(async () => {
    try {
      await remove(deltaRef);
    } catch (error) {
      console.error('Failed to clear delta:', error);
    }
  }, 5000);
}

/**
 * Broadcast real-time position update during drag (RTDB only, no Firestore)
 * This is for smooth real-time sync without persisting every frame
 */
export async function broadcastPositionUpdate(
  canvasId: string,
  objectId: string,
  position: { x: number; y: number }
): Promise<void> {
  const rtdb = getRTDB();
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates: { position },
    timestamp: Date.now(),
  });
}

/**
 * Broadcast real-time transform update during resize/rotate (RTDB only, no Firestore)
 * This is for smooth real-time sync of transformations
 */
export async function broadcastTransformUpdate(
  canvasId: string,
  objectId: string,
  updates: {
    position?: { x: number; y: number };
    width?: number;
    height?: number;
    rotation?: number;
  }
): Promise<void> {
  const rtdb = getRTDB();
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates,
    timestamp: Date.now(),
  });
}

/**
 * Broadcast that a user is starting to transform an object
 */
export async function broadcastTransformStart(
  canvasId: string,
  objectId: string,
  userId: string
): Promise<void> {
  const rtdb = getRTDB();
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates: { transformingBy: userId },
    timestamp: Date.now(),
  });
}

/**
 * Broadcast that a user has finished transforming an object
 */
export async function broadcastTransformEnd(
  canvasId: string,
  objectId: string
): Promise<void> {
  const rtdb = getRTDB();
  const deltaRef = ref(rtdb, `deltas/${canvasId}/${objectId}`);
  await set(deltaRef, {
    id: objectId,
    updates: { transformingBy: undefined },
    timestamp: Date.now(),
  });
}

/**
 * Subscribe to object updates via RTDB
 */
export function subscribeToObjectUpdates(
  canvasId: string,
  callback: (update: ObjectUpdate) => void
): () => void {
  const rtdb = getRTDB();
  const deltasRef = ref(rtdb, `deltas/${canvasId}`);
  
  const unsubscribe = onValue(deltasRef, (snapshot) => {
    const deltas = snapshot.val() || {};
    
    Object.values(deltas).forEach((delta) => {
      if (delta && typeof delta === 'object' && 'id' in delta) {
        callback(delta as ObjectUpdate);
      }
    });
  });
  
  return unsubscribe;
}

/**
 * Subscribe to all objects in Firestore (initial load and changes)
 */
export function subscribeToCanvasObjects(
  canvasId: string,
  callback: (objects: CanvasObject[]) => void
): () => void {
  const db = getFirestore();
  const objectsRef = collection(db, 'canvases', canvasId, 'objects');
  
  const unsubscribe = onSnapshot(objectsRef, (snapshot) => {
    const objects = snapshot.docs.map((doc) => doc.data() as CanvasObject);
    callback(objects);
  });
  
  return unsubscribe;
}

/**
 * Broadcast shape preview position (for creation mode)
 * Shows other users where this user is about to place a shape
 */
export async function broadcastShapePreview(
  canvasId: string,
  preview: ShapePreview | null,
  userId: string
): Promise<void> {
  try {
    const rtdb = getRTDB();
    const previewRef = ref(rtdb, `shapePreviews/${canvasId}/${userId}`);
    
    if (preview) {
      await set(previewRef, preview);
      console.log('[ShapePreview] Preview broadcast:', { canvasId, userId, type: preview.type });
    } else {
      // Clear preview - userId is required to know which preview to remove
      await remove(previewRef);
      console.log('[ShapePreview] Preview cleared:', { canvasId, userId });
    }
  } catch (error) {
    console.error('[ShapePreview] Failed to broadcast preview:', {
      canvasId,
      userId,
      error,
      message: error instanceof Error ? error.message : String(error)
    });
    // Don't throw - preview is non-critical functionality
  }
}

/**
 * Subscribe to shape previews from all users
 */
export function subscribeToShapePreviews(
  canvasId: string,
  callback: (previews: Record<string, ShapePreview>) => void
): () => void {
  const rtdb = getRTDB();
  const previewsRef = ref(rtdb, `shapePreviews/${canvasId}`);
  
  console.log('[ShapePreview] Subscribing to previews:', { canvasId });
  
  const unsubscribe = onValue(
    previewsRef, 
    (snapshot) => {
      const previews = snapshot.val() || {};
      const previewCount = Object.keys(previews).length;
      console.log('[ShapePreview] Previews updated:', { canvasId, count: previewCount, userIds: Object.keys(previews) });
      callback(previews);
    },
    (error) => {
      console.error('[ShapePreview] Subscription error:', {
        canvasId,
        error,
        message: error.message,
        code: (error as any).code
      });
    }
  );
  
  return unsubscribe;
}

// ============ Layer Sync Functions ============

/**
 * Create a layer in Firestore
 */
export async function createLayer(canvasId: string, layer: Layer): Promise<void> {
  const db = getFirestore();
  const layerRef = doc(db, 'canvases', canvasId, 'layers', layer.id);
  await setDoc(layerRef, layer);
}

/**
 * Update a layer in Firestore
 */
export async function updateLayer(
  canvasId: string,
  layerId: string,
  updates: Partial<Layer>
): Promise<void> {
  const db = getFirestore();
  const layerRef = doc(db, 'canvases', canvasId, 'layers', layerId);
  
  await updateDoc(layerRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

/**
 * Delete a layer from Firestore
 */
export async function deleteLayer(canvasId: string, layerId: string): Promise<void> {
  const db = getFirestore();
  const layerRef = doc(db, 'canvases', canvasId, 'layers', layerId);
  await deleteDoc(layerRef);
}

/**
 * Get all layers for a canvas
 */
export async function getCanvasLayers(canvasId: string): Promise<Layer[]> {
  const db = getFirestore();
  const layersRef = collection(db, 'canvases', canvasId, 'layers');
  const snapshot = await getDocs(layersRef);
  
  return snapshot.docs.map((doc) => doc.data() as Layer);
}

/**
 * Subscribe to layers in Firestore (real-time sync)
 */
export function subscribeToCanvasLayers(
  canvasId: string,
  callback: (layers: Layer[]) => void
): () => void {
  const db = getFirestore();
  const layersRef = collection(db, 'canvases', canvasId, 'layers');
  
  const unsubscribe = onSnapshot(layersRef, (snapshot) => {
    const layers = snapshot.docs.map((doc) => doc.data() as Layer);
    callback(layers);
  });
  
  return unsubscribe;
}

/**
 * Initialize Default Layer for a canvas if it doesn't exist
 */
export async function initializeDefaultLayer(canvasId: string): Promise<void> {
  const db = getFirestore();
  const defaultLayerRef = doc(db, 'canvases', canvasId, 'layers', DEFAULT_LAYER_ID);
  const snapshot = await getDoc(defaultLayerRef);
  
  if (!snapshot.exists()) {
    const defaultLayer: Layer = {
      id: DEFAULT_LAYER_ID,
      name: DEFAULT_LAYER_NAME,
      visible: true,
      locked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    await setDoc(defaultLayerRef, defaultLayer);
  }
}

/**
 * Create Default Layer for a new canvas
 * Alias for initializeDefaultLayer for clarity in Lookbooks feature
 */
export async function createDefaultLayer(canvasId: string): Promise<void> {
  return initializeDefaultLayer(canvasId);
}

