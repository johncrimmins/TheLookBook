import { create } from 'zustand';
import { HistoryAction, HistoryState } from '../types';

// Maximum number of actions to keep in history
const MAX_HISTORY_DEPTH = 50;

/**
 * Zustand store for managing undo/redo history
 * Each user maintains their own undo and redo stacks
 */
export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStacks: {},
  redoStacks: {},

  recordAction: (actionData) => {
    const action: HistoryAction = {
      ...actionData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    set((state) => {
      const userId = action.userId;
      const currentStack = state.undoStacks[userId] || [];
      
      // Add action to undo stack (limit to MAX_HISTORY_DEPTH)
      const newStack = [...currentStack, action].slice(-MAX_HISTORY_DEPTH);
      
      // Clear redo stack when new action is performed
      const newRedoStacks = { ...state.redoStacks };
      delete newRedoStacks[userId];

      return {
        undoStacks: {
          ...state.undoStacks,
          [userId]: newStack,
        },
        redoStacks: newRedoStacks,
      };
    });
  },

  undo: (userId) => {
    const state = get();
    const undoStack = state.undoStacks[userId] || [];
    
    if (undoStack.length === 0) {
      return null;
    }

    // Pop last action from undo stack
    const action = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    // Push to redo stack
    const redoStack = state.redoStacks[userId] || [];
    const newRedoStack = [...redoStack, action];

    set({
      undoStacks: {
        ...state.undoStacks,
        [userId]: newUndoStack,
      },
      redoStacks: {
        ...state.redoStacks,
        [userId]: newRedoStack,
      },
    });

    return action;
  },

  redo: (userId) => {
    const state = get();
    const redoStack = state.redoStacks[userId] || [];
    
    if (redoStack.length === 0) {
      return null;
    }

    // Pop last action from redo stack
    const action = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    // Push back to undo stack
    const undoStack = state.undoStacks[userId] || [];
    const newUndoStack = [...undoStack, action];

    set({
      undoStacks: {
        ...state.undoStacks,
        [userId]: newUndoStack,
      },
      redoStacks: {
        ...state.redoStacks,
        [userId]: newRedoStack,
      },
    });

    return action;
  },

  canUndo: (userId) => {
    const state = get();
    const undoStack = state.undoStacks[userId] || [];
    return undoStack.length > 0;
  },

  canRedo: (userId) => {
    const state = get();
    const redoStack = state.redoStacks[userId] || [];
    return redoStack.length > 0;
  },

  clearHistory: (userId) => {
    set((state) => {
      const newUndoStacks = { ...state.undoStacks };
      const newRedoStacks = { ...state.redoStacks };
      delete newUndoStacks[userId];
      delete newRedoStacks[userId];

      return {
        undoStacks: newUndoStacks,
        redoStacks: newRedoStacks,
      };
    });
  },
}));

