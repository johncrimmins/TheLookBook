// Selection store - manages object selection state (LOCAL ONLY)
import { create } from 'zustand';
import { CanvasObject } from '../types';
import { useObjectsStore, generateObjectName } from './objectsStore';

/**
 * SELECTION STATE IS LOCAL ONLY
 * 
 * - Never persisted to localStorage
 * - Never synced to Firebase
 * - Clears on page refresh
 * - Each user has their own selection
 * 
 * When user manipulates objects (drag/resize), that triggers sync
 * via the existing transformingBy mechanism, not selection state.
 */

interface SelectionState {
  // Selection state
  selectedIds: string[];
  selectObject: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  toggleObjectSelection: (id: string) => void;
  isSelected: (id: string) => boolean;
  
  // Bulk operations (operate on selectedIds)
  deleteSelected: () => void;
  duplicateSelected: () => void;
  moveSelected: (deltaX: number, deltaY: number) => void;
  updateSelectedProperty: (property: string, value: unknown) => void;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  // Selection state (local only, not persisted)
  selectedIds: [],
  
  selectObject: (id) =>
    set(() => ({
      selectedIds: [id],
    })),
  
  selectMultiple: (ids) =>
    set(() => ({
      selectedIds: ids,
    })),
  
  clearSelection: () =>
    set(() => ({
      selectedIds: [],
    })),
  
  toggleObjectSelection: (id) =>
    set((state) => {
      const isCurrentlySelected = state.selectedIds.includes(id);
      if (isCurrentlySelected) {
        return {
          selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
        };
      } else {
        return {
          selectedIds: [...state.selectedIds, id],
        };
      }
    }),
  
  isSelected: (id) => {
    const state = get();
    return state.selectedIds.includes(id);
  },
  
  // Bulk operations
  deleteSelected: () => {
    const state = get();
    const { removeObject } = useObjectsStore.getState();
    
    // Delete each selected object
    state.selectedIds.forEach((id) => {
      removeObject(id);
    });
    
    // Clear selection after delete
    set({ selectedIds: [] });
  },
  
  duplicateSelected: () => {
    const state = get();
    const { objects, addObject } = useObjectsStore.getState();
    const newIds: string[] = [];
    const timestamp = Date.now();
    
    state.selectedIds.forEach((id) => {
      const original = objects[id];
      if (original) {
        // Generate new UUID (simple implementation)
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
          name: generateObjectName(original.type, newId),
        };
        
        addObject(duplicated);
      }
    });
    
    // Select the newly duplicated objects
    set({ selectedIds: newIds });
  },
  
  moveSelected: (deltaX, deltaY) => {
    const state = get();
    const { objects, updateObject } = useObjectsStore.getState();
    const timestamp = Date.now();
    
    state.selectedIds.forEach((id) => {
      const object = objects[id];
      if (object) {
        updateObject(id, {
          position: {
            x: object.position.x + deltaX,
            y: object.position.y + deltaY,
          },
          updatedAt: timestamp,
        });
      }
    });
  },
  
  updateSelectedProperty: (property, value) => {
    const state = get();
    const { updateObject } = useObjectsStore.getState();
    const timestamp = Date.now();
    
    state.selectedIds.forEach((id) => {
      updateObject(id, {
        [property]: value,
        updatedAt: timestamp,
      });
    });
  },
}));

