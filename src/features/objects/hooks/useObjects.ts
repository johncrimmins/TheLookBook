// Objects hook - manages objects state and operations
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useObjectsStore, generateLayerName } from '../lib/objectsStore';
import { useSelectionStore } from '../lib/selectionStore';
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
  subscribeToCanvasLayers,
  initializeDefaultLayer,
  createLayer as createLayerService,
  updateLayer as updateLayerService,
  deleteLayer as deleteLayerService,
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
  
  // Layer state
  const setLayers = useObjectsStore((state) => state.setLayers);
  const createLayerInStore = useObjectsStore((state) => state.createLayer);
  const updateLayerInStore = useObjectsStore((state) => state.updateLayer);
  const deleteLayerInStore = useObjectsStore((state) => state.deleteLayer);
  const initializeDefaultLayerInStore = useObjectsStore((state) => state.initializeDefaultLayer);
  
  // Initialize Default Layer and subscribe to layers
  useEffect(() => {
    if (!canvasId) return;
    
    let isSubscribed = true;
    
    // Initialize Default Layer
    (async () => {
      await initializeDefaultLayer(canvasId);
      // Also initialize in store
      initializeDefaultLayerInStore();
    })();
    
    // Subscribe to layers
    const unsubscribeLayers = subscribeToCanvasLayers(canvasId, (fetchedLayers) => {
      if (isSubscribed) {
        setLayers(fetchedLayers);
        
        // Initialize expanded state for all layers
        fetchedLayers.forEach(layer => {
          initializeDefaultLayerInStore();
        });
      }
    });
    
    return () => {
      isSubscribed = false;
      unsubscribeLayers();
    };
  }, [canvasId, setLayers, initializeDefaultLayerInStore]);
  
  // Subscribe to objects on mount
  useEffect(() => {
    if (!canvasId) return;
    
    let isSubscribed = true;
    
    // Subscribe to Firestore for initial load and persistence
    const unsubscribeFirestore = subscribeToCanvasObjects(canvasId, (fetchedObjects) => {
      if (isSubscribed) {
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
        order: Date.now(), // Use timestamp for unique ordering
        createdBy: user.id,
      };
      
      try {
        const object = await createObjectService(canvasId, newObject);
        
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

  // Order operations (Konva best practice: control render order via array position)
  const bringToFront = useCallback(
    (objectId: string) => {
      const allObjects = Object.values(objects);
      if (allObjects.length === 0) return;
      
      // Find the maximum order value
      const maxOrder = Math.max(...allObjects.map(obj => obj.order));
      
      // Set this object's order to max + 1 (renders last = front)
      updateObject(objectId, { order: maxOrder + 1 });
    },
    [objects, updateObject]
  );

  const sendToBack = useCallback(
    (objectId: string) => {
      const allObjects = Object.values(objects);
      if (allObjects.length === 0) return;
      
      // Find the minimum order value
      const minOrder = Math.min(...allObjects.map(obj => obj.order));
      
      // Set this object's order to min - 1 (renders first = back)
      updateObject(objectId, { order: minOrder - 1 });
    },
    [objects, updateObject]
  );

  // Get selection from selectionStore (now separate)
  const { selectedIds } = useSelectionStore();
  
  // Helper to get selected objects
  const getSelectedObjects = useCallback(() => {
    return selectedIds
      .map((id) => objects[id])
      .filter(Boolean);
  }, [selectedIds, objects]);

  // Delete all selected objects with history
  const bulkDelete = useCallback(async () => {
    if (!canvasId || !user || selectedIds.length === 0) return;
    
    // Get selected objects before deletion
    const selectedObjects = getSelectedObjects();
    
    // Record deletion of all selected objects
    selectedObjects.forEach(obj => {
      recordAction({
        userId: user.id,
        type: 'delete',
        objectId: obj.id,
        beforeState: obj,
        afterState: null,
      });
    });
    
    // Delete from local store
    selectedObjects.forEach(obj => {
      removeObject(obj.id);
    });
    
    // Delete from Firestore
    await Promise.all(
      selectedObjects.map(obj => deleteObjectService(canvasId, obj.id))
    ).catch(console.error);
    
    // Clear selection
    const { clearSelection } = useSelectionStore.getState();
    clearSelection();
  }, [canvasId, user, selectedIds, getSelectedObjects, recordAction, removeObject]);

  // Duplicate all selected objects with history
  const bulkDuplicate = useCallback(async () => {
    if (!canvasId || !user || selectedIds.length === 0) return;
    
    const selectedObjects = getSelectedObjects();
    const newIds: string[] = [];
    const timestamp = Date.now();
    
    // Create duplicates
    for (const original of selectedObjects) {
      const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      newIds.push(newId);
      
      // Clone object with 20px offset and new ID
      const duplicated: CanvasObject = {
        ...original,
        id: newId,
        position: {
          x: original.position.x + 20,
          y: original.position.y + 20,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
        // Auto-generate new name for duplicate
        name: generateLayerName(original.type, newId),
      };
      
      // Record creation
      recordAction({
        userId: user.id,
        type: 'create',
        objectId: newId,
        beforeState: null,
        afterState: duplicated,
      });
      
      // Add to local store
      addObjectToStore(duplicated);
      
      // Persist to Firestore
      const db = require('../lib/firebase').getFirestore();
      const { doc, setDoc } = require('firebase/firestore');
      const objectRef = doc(db, 'canvases', canvasId, 'objects', newId);
      await setDoc(objectRef, duplicated);
    }
    
    // Select the newly duplicated objects
    const { selectMultiple } = useSelectionStore.getState();
    selectMultiple(newIds);
  }, [canvasId, user, selectedIds, getSelectedObjects, recordAction, addObjectToStore]);

  // Copy selected objects to clipboard
  const bulkCopy = useCallback(() => {
    const selectedObjects = getSelectedObjects();
    if (selectedObjects.length === 0) return false;
    
    const { copyToClipboard } = require('@/shared/lib/clipboard');
    return copyToClipboard(selectedObjects, canvasId || undefined);
  }, [getSelectedObjects, canvasId]);

  // Paste objects from clipboard
  const bulkPaste = useCallback(async () => {
    if (!canvasId || !user) return;
    
    const { pasteFromClipboard } = require('@/shared/lib/clipboard');
    const clipboardData = pasteFromClipboard();
    
    if (!clipboardData || !clipboardData.objects) return;
    
    const timestamp = Date.now();
    const newObjects: CanvasObject[] = [];
    
    // Create new objects with offset
    for (const clipboardObject of clipboardData.objects) {
      const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const newObject: CanvasObject = {
        ...clipboardObject,
        id: newId,
        position: {
          x: clipboardObject.position.x + 20,
          y: clipboardObject.position.y + 20,
        },
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: user.id,
        // Auto-generate new name for pasted object
        name: generateLayerName(clipboardObject.type, newId),
      };
      
      newObjects.push(newObject);
      
      // Record creation
      recordAction({
        userId: user.id,
        type: 'create',
        objectId: newId,
        beforeState: null,
        afterState: newObject,
      });
      
      // Add to store
      addObjectToStore(newObject);
      
      // Persist to Firestore
      const db = require('../lib/firebase').getFirestore();
      const { doc, setDoc } = require('firebase/firestore');
      const objectRef = doc(db, 'canvases', canvasId, 'objects', newId);
      await setDoc(objectRef, newObject);
    }
    
    // Select the newly pasted objects
    const { selectMultiple } = useSelectionStore.getState();
    selectMultiple(newObjects.map(obj => obj.id));
  }, [canvasId, user, recordAction, addObjectToStore]);

  // Move selected objects (used during bulk drag)
  const bulkMove = useCallback(async (deltaX: number, deltaY: number) => {
    if (!canvasId || !user || selectedIds.length === 0) return;
    
    // Get objects before move for history
    const selectedObjects = getSelectedObjects();
    const timestamp = Date.now();
    
    // Move each object
    selectedObjects.forEach(obj => {
      const newPosition = {
        x: obj.position.x + deltaX,
        y: obj.position.y + deltaY,
      };
      
      // Record history
      recordAction({
        userId: user.id,
        type: 'update',
        objectId: obj.id,
        beforeState: { position: obj.position },
        afterState: { position: newPosition },
      });
      
      // Update in store
      updateObjectInStore(obj.id, {
        position: newPosition,
        updatedAt: timestamp,
      });
    });
    
    // Persist to Firestore
    const updatedObjects = getSelectedObjects();
    await Promise.all(
      updatedObjects.map(obj => 
        updateObjectService(canvasId, obj.id, { position: obj.position })
      )
    ).catch(console.error);
  }, [canvasId, user, selectedIds, getSelectedObjects, recordAction, updateObjectInStore]);

  // Update property for all selected objects
  const bulkUpdateProperty = useCallback(async (property: string, value: unknown) => {
    if (!canvasId || !user || selectedIds.length === 0) return;
    
    // Get objects before update for history
    const selectedObjects = getSelectedObjects();
    const timestamp = Date.now();
    
    // Update each object
    selectedObjects.forEach(obj => {
      // Record history
      recordAction({
        userId: user.id,
        type: 'update',
        objectId: obj.id,
        beforeState: { [property]: (obj as never)[property] },
        afterState: { [property]: value },
      });
      
      // Update in store
      updateObjectInStore(obj.id, {
        [property]: value,
        updatedAt: timestamp,
      });
    });
    
    // Persist to Firestore
    await Promise.all(
      selectedIds.map(id => 
        updateObjectService(canvasId, id, { [property]: value })
      )
    ).catch(console.error);
  }, [canvasId, user, selectedIds, getSelectedObjects, recordAction, updateObjectInStore]);

  // Layer operations with Firestore sync
  const createLayer = useCallback(async (name?: string) => {
    if (!canvasId) return;
    
    const newLayer = createLayerInStore(name);
    
    // Sync to Firestore
    await createLayerService(canvasId, newLayer).catch(console.error);
    
    return newLayer;
  }, [canvasId, createLayerInStore]);
  
  const updateLayer = useCallback(async (layerId: string, updates: Record<string, unknown>) => {
    if (!canvasId) return;
    
    // Update in store (optimistic)
    updateLayerInStore(layerId, updates);
    
    // Sync to Firestore
    await updateLayerService(canvasId, layerId, updates).catch(console.error);
  }, [canvasId, updateLayerInStore]);
  
  const deleteLayer = useCallback(async (layerId: string) => {
    if (!canvasId) return;
    
    // Delete in store
    deleteLayerInStore(layerId);
    
    // Sync to Firestore
    await deleteLayerService(canvasId, layerId).catch(console.error);
  }, [canvasId, deleteLayerInStore]);

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
    bringToFront,
    sendToBack,
    // Bulk operations
    selectedIds,
    bulkDelete,
    bulkDuplicate,
    bulkCopy,
    bulkPaste,
    bulkMove,
    bulkUpdateProperty,
    // Layer operations
    createLayer,
    updateLayer,
    deleteLayer,
  };
}

