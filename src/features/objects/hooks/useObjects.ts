// Objects hook - manages objects state and operations
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useObjectsStore } from '../lib/objectsStore';
import { useAuth } from '@/features/auth';
import { CanvasObject, CreateObjectParams } from '../types';
import { Point } from '@/shared/types';
import { debounce, throttle } from '@/shared/lib/utils';
import { useHistoryStore } from '@/features/history';
import {
  createObject as createObjectService,
  updateObject as updateObjectService,
  deleteObject as deleteObjectService,
  subscribeToObjectUpdates,
  subscribeToCanvasObjects,
  broadcastPositionUpdate,
  broadcastTransformUpdate,
  broadcastTransformStart,
  broadcastTransformEnd,
} from '../services/objectsService';

/**
 * Hook to manage canvas objects
 */
export function useObjects(canvasId: string | null) {
  const { user } = useAuth();
  const objects = useObjectsStore((state) => state.objects);
  const setObjects = useObjectsStore((state) => state.setObjects);
  const addObjectToStore = useObjectsStore((state) => state.addObject);
  const updateObjectInStore = useObjectsStore((state) => state.updateObject);
  const removeObject = useObjectsStore((state) => state.removeObject);
  const recordAction = useHistoryStore((state) => state.recordAction);
  
  // Subscribe to objects on mount
  useEffect(() => {
    if (!canvasId) return;
    
    let isSubscribed = true;
    
    // Subscribe to Firestore for initial load and persistence
    const unsubscribeFirestore = subscribeToCanvasObjects(canvasId, (fetchedObjects) => {
      if (isSubscribed) {
        console.log(`[Persistence] Loaded ${fetchedObjects.length} objects from Firestore for canvas: ${canvasId}`);
        const objectsMap = fetchedObjects.reduce((acc, obj) => {
          acc[obj.id] = obj;
          return acc;
        }, {} as Record<string, CanvasObject>);
        
        setObjects(objectsMap);
      }
    });
    
    // Subscribe to RTDB for real-time updates
    const unsubscribeRTDB = subscribeToObjectUpdates(canvasId, (update) => {
      if (isSubscribed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('deleted' in update && (update as any).deleted) {
          removeObject(update.id);
        } else {
          // Merge updates into existing object
          updateObjectInStore(update.id, update.updates);
        }
      }
    });
    
    return () => {
      isSubscribed = false;
      unsubscribeFirestore();
      unsubscribeRTDB();
    };
  }, [canvasId, setObjects, removeObject, updateObjectInStore]);
  
  // Create object
  const createObject = useCallback(
    async (params: CreateObjectParams, shouldRecord = true) => {
      if (!canvasId || !user) return;
      
      const newObject: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
        type: params.type,
        position: { x: params.x, y: params.y },
        width: params.width || 100,
        height: params.height || 100,
        rotation: 0,
        fill: params.fill || '#3B82F6',
        opacity: 1.0,
        createdBy: user.id,
      };
      
      try {
        const object = await createObjectService(canvasId, newObject);
        console.log(`[Persistence] Created object ${object.id} in Firestore`);
        
        // Record in history before adding to store
        if (shouldRecord) {
          recordAction({
            userId: user.id,
            type: 'create',
            objectId: object.id,
            beforeState: null,
            afterState: object,
          });
        }
        
        // Optimistically add to local state
        addObjectToStore(object);
        return object;
      } catch (error) {
        console.error('[Persistence] Failed to create object:', error);
        throw error;
      }
    },
    [canvasId, user, addObjectToStore, recordAction]
  );
  
  // Throttled broadcast for real-time position updates during drag (60fps = 16ms)
  // Track drag start positions for history recording
  const dragStartPositions = useRef<Record<string, { x: number; y: number }>>({});

  const throttledBroadcast = useRef(
    throttle(async (canvasId: string, objectId: string, position: Point) => {
      try {
        await broadcastPositionUpdate(canvasId, objectId, position);
      } catch (error) {
        console.error('Failed to broadcast position:', error);
      }
    }, 16)
  ).current;

  // Throttled broadcast for real-time transform updates during resize/rotate (60fps = 16ms)
  const throttledTransformBroadcast = useRef(
    throttle(async (canvasId: string, objectId: string, updates: Partial<CanvasObject>) => {
      try {
        await broadcastTransformUpdate(canvasId, objectId, updates);
      } catch (error) {
        console.error('Failed to broadcast transform:', error);
      }
    }, 16)
  ).current;

  // Broadcast object position during drag (real-time, throttled)
  const broadcastObjectMove = useCallback(
    (objectId: string, position: Point) => {
      if (!canvasId) return;
      
      // Optimistic local update for smooth dragging
      updateObjectInStore(objectId, { position });
      
      // Broadcast to RTDB for other users (throttled to 60fps)
      throttledBroadcast(canvasId, objectId, position);
    },
    [canvasId, updateObjectInStore, throttledBroadcast]
  );

  // Broadcast transform start (user begins resizing/rotating)
  const broadcastObjectTransformStart = useCallback(
    async (objectId: string) => {
      if (!canvasId || !user) return;
      
      try {
        await broadcastTransformStart(canvasId, objectId, user.id);
      } catch (error) {
        console.error('Failed to broadcast transform start:', error);
      }
    },
    [canvasId, user]
  );

  // Broadcast transform updates during resize/rotate (real-time, throttled)
  const broadcastObjectTransform = useCallback(
    (objectId: string, updates: Partial<CanvasObject>) => {
      if (!canvasId) return;
      
      // Optimistic local update for smooth transforming
      updateObjectInStore(objectId, updates);
      
      // Broadcast to RTDB for other users (throttled to 60fps)
      throttledTransformBroadcast(canvasId, objectId, updates);
    },
    [canvasId, updateObjectInStore, throttledTransformBroadcast]
  );

  // Broadcast transform end (user finishes resizing/rotating)
  const broadcastObjectTransformEnd = useCallback(
    async (objectId: string) => {
      if (!canvasId) return;
      
      try {
        await broadcastTransformEnd(canvasId, objectId);
      } catch (error) {
        console.error('Failed to broadcast transform end:', error);
      }
    },
    [canvasId]
  );

  // Update object position (debounced for Firestore persistence)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateObjectPosition = useCallback(
    debounce(async (objectId: string, position: Point) => {
      if (!canvasId) return;
      
      try {
        await updateObjectService(canvasId, objectId, { position });
        console.log(`[Persistence] Updated object ${objectId} position in Firestore:`, position);
      } catch (error) {
        console.error('[Persistence] Failed to update object position:', error);
      }
    }, 300),
    [canvasId]
  );
  
  // Delete object
  const deleteObject = useCallback(
    async (objectId: string, shouldRecord = true) => {
      if (!canvasId || !user) return;
      
      try {
        // Get current state before deletion for history
        const currentObject = objects[objectId];
        
        // Record in history before deletion
        if (shouldRecord && currentObject) {
          recordAction({
            userId: user.id,
            type: 'delete',
            objectId,
            beforeState: currentObject,
            afterState: null,
          });
        }
        
        // Optimistically remove from local state
        removeObject(objectId);
        await deleteObjectService(canvasId, objectId);
      } catch (error) {
        console.error('Failed to delete object:', error);
        throw error;
      }
    },
    [canvasId, user, objects, removeObject, recordAction]
  );
  
  // Helper to add object without recording (for undo/redo)
  const addObject = useCallback(
    async (object: CanvasObject) => {
      if (!canvasId || !user) return;
      
      try {
        // If this is a redo/restore, we already have the full object
        // Just need to persist it
        const db = (await import('../lib/firebase')).getFirestore();
        const { doc, setDoc } = await import('firebase/firestore');
        const objectRef = doc(db, 'canvases', canvasId, 'objects', object.id);
        await setDoc(objectRef, object);
        
        // Broadcast via RTDB
        const { broadcastObjectUpdate } = await import('../services/objectsService');
        await broadcastObjectUpdate(canvasId, {
          id: object.id,
          updates: object,
          timestamp: Date.now(),
        });
        
        // Add to local state
        addObjectToStore(object);
      } catch (error) {
        console.error('Failed to add object:', error);
        throw error;
      }
    },
    [canvasId, user, addObjectToStore]
  );

  // Update object with history recording
  const updateObject = useCallback(
    async (objectId: string, updates: Partial<CanvasObject>, shouldRecord = true) => {
      if (!canvasId || !user) return;
      
      // Get current state before update for history
      const currentObject = objects[objectId];
      
      // Record in history before update
      if (shouldRecord && currentObject) {
        // Only record the fields that are changing
        const changedFields: Partial<CanvasObject> = {};
        Object.keys(updates).forEach((key) => {
          const k = key as keyof CanvasObject;
          if (currentObject[k] !== updates[k]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (changedFields as any)[k] = currentObject[k];
          }
        });
        
        if (Object.keys(changedFields).length > 0) {
          recordAction({
            userId: user.id,
            type: 'update',
            objectId,
            beforeState: changedFields,
            afterState: updates,
          });
        }
      }
      
      // Optimistic local update
      updateObjectInStore(objectId, updates);
      
      // Persist to backend
      await updateObjectService(canvasId, objectId, updates).catch(console.error);
    },
    [canvasId, user, objects, updateObjectInStore, recordAction]
  );

  // Start tracking a drag operation
  const startObjectDrag = useCallback(
    (objectId: string) => {
      const currentObject = objects[objectId];
      if (currentObject) {
        // Capture position before drag starts
        dragStartPositions.current[objectId] = { ...currentObject.position };
      }
    },
    [objects]
  );

  // Finish drag operation with history recording
  const finishObjectDrag = useCallback(
    async (objectId: string, finalPosition: Point) => {
      if (!canvasId || !user) return;
      
      // Get the original position from before the drag
      const originalPosition = dragStartPositions.current[objectId];
      
      if (originalPosition) {
        // Only record if position actually changed
        if (originalPosition.x !== finalPosition.x || originalPosition.y !== finalPosition.y) {
          // Record in history with correct before/after states
          recordAction({
            userId: user.id,
            type: 'update',
            objectId,
            beforeState: { position: originalPosition },
            afterState: { position: finalPosition },
          });
        }
        
        // Clean up
        delete dragStartPositions.current[objectId];
      }
      
      // Persist final position to Firestore
      await updateObjectPosition(objectId, finalPosition);
    },
    [canvasId, user, recordAction, updateObjectPosition]
  );

  return {
    objects: Object.values(objects),
    objectsMap: objects,
    createObject,
    updateObjectPosition,
    broadcastObjectMove,
    broadcastObjectTransformStart,
    broadcastObjectTransform,
    broadcastObjectTransformEnd,
    deleteObject,
    updateObject,
    addObject,
    startObjectDrag,
    finishObjectDrag,
  };
}

