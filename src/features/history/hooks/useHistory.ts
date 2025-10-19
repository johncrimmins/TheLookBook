import { useEffect, useCallback } from 'react';
import { useHistoryStore } from '../lib/historyStore';
import { useAuth } from '@/features/auth';
import { CanvasObject } from '@/features/objects/types';

// Type for object operations that need to be passed to useHistory
export interface HistoryObjectOperations {
  addObject: (object: CanvasObject, shouldRecord?: boolean) => Promise<void>;
  updateObject: (objectId: string, updates: Partial<CanvasObject>, shouldRecord?: boolean) => Promise<void>;
  deleteObject: (objectId: string, shouldRecord?: boolean) => Promise<void>;
}

/**
 * Hook for managing undo/redo functionality
 * Provides methods to undo and redo actions, and keyboard shortcuts
 */
export function useHistory(operations?: HistoryObjectOperations) {
  const { user } = useAuth();
  const { recordAction, undo, redo, canUndo, canRedo } = useHistoryStore();

  /**
   * Execute an undo operation
   */
  const executeUndo = useCallback(async () => {
    if (!user?.id || !operations) return;

    const action = undo(user.id);
    if (!action) return;

    try {
      switch (action.type) {
        case 'create':
          // Undo create: Delete the object
          await operations.deleteObject(action.objectId, false); // false = don't record in history
          break;

        case 'delete':
          // Undo delete: Restore the object
          if (action.beforeState) {
            await operations.addObject(action.beforeState as CanvasObject, false);
          }
          break;

        case 'update':
        case 'duplicate':
        case 'paste':
          // Undo update/duplicate/paste: Restore previous state
          if (action.beforeState) {
            await operations.updateObject(action.objectId, action.beforeState, false);
          }
          break;
      }
    } catch (error) {
      console.error('Error executing undo:', error);
      // If undo fails, push action back to undo stack
      recordAction({
        ...action,
        userId: user.id,
      });
    }
  }, [user, undo, operations, recordAction]);

  /**
   * Execute a redo operation
   */
  const executeRedo = useCallback(async () => {
    if (!user?.id || !operations) return;

    const action = redo(user.id);
    if (!action) return;

    try {
      switch (action.type) {
        case 'create':
          // Redo create: Recreate the object
          if (action.afterState) {
            await operations.addObject(action.afterState as CanvasObject, false);
          }
          break;

        case 'delete':
          // Redo delete: Delete the object again
          await operations.deleteObject(action.objectId, false);
          break;

        case 'update':
        case 'duplicate':
        case 'paste':
          // Redo update/duplicate/paste: Apply after state
          if (action.afterState) {
            await operations.updateObject(action.objectId, action.afterState, false);
          }
          break;
      }
    } catch (error) {
      console.error('Error executing redo:', error);
    }
  }, [user, redo, operations]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd key
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (!modKey) return;

      // Ctrl+Z or Cmd+Z: Undo
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        executeUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z: Redo
      else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        executeRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeUndo, executeRedo]);

  return {
    canUndo: user?.id ? canUndo(user.id) : false,
    canRedo: user?.id ? canRedo(user.id) : false,
    undo: executeUndo,
    redo: executeRedo,
    recordAction,
  };
}

