import { CanvasObject } from '@/features/objects/types';

/**
 * Types of actions that can be undone/redone
 */
export type ActionType = 'create' | 'delete' | 'update' | 'duplicate' | 'paste';

/**
 * A single action in the history stack
 */
export interface HistoryAction {
  id: string;                              // Unique action ID
  userId: string;                          // Who performed the action
  timestamp: number;                       // When the action occurred
  type: ActionType;                        // Type of action
  objectId: string;                        // ID of the affected object
  beforeState: Partial<CanvasObject> | null;  // Object state before action (null for create)
  afterState: Partial<CanvasObject> | null;   // Object state after action (null for delete)
}

/**
 * State for the history store
 */
export interface HistoryState {
  // Per-user undo stacks (userId -> array of actions)
  undoStacks: Record<string, HistoryAction[]>;
  
  // Per-user redo stacks (userId -> array of actions)
  redoStacks: Record<string, HistoryAction[]>;
  
  // Record a new action
  recordAction: (action: Omit<HistoryAction, 'id' | 'timestamp'>) => void;
  
  // Undo the last action for a user
  undo: (userId: string) => HistoryAction | null;
  
  // Redo the last undone action for a user
  redo: (userId: string) => HistoryAction | null;
  
  // Check if user can undo
  canUndo: (userId: string) => boolean;
  
  // Check if user can redo
  canRedo: (userId: string) => boolean;
  
  // Clear all history for a user
  clearHistory: (userId: string) => void;
}

