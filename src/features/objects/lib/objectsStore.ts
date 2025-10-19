// Objects store - manages canvas objects (domain data only)
import { create } from 'zustand';
import { CanvasObject } from '../types';

/**
 * Generate a display name for a layer
 * @param type - Object type (rectangle, circle, etc.)
 * @param id - Object ID
 * @returns Auto-generated name like "Rectangle a3f2" or "Circle b7e1"
 */
export const generateLayerName = (type: string, id: string): string => {
  // Defensive check for undefined values
  if (!type || !id) {
    console.warn('generateLayerName called with undefined values:', { type, id });
    return 'Unknown Object';
  }
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  return `${capitalize(type)} ${id.slice(0, 4)}`;
};

interface ObjectsState {
  objects: Record<string, CanvasObject>;
  setObjects: (objects: Record<string, CanvasObject>) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void;
  removeObject: (objectId: string) => void;
  
  // Layer management
  reorderLayer: (draggedId: string, targetId: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
}

export const useObjectsStore = create<ObjectsState>((set, get) => ({
  objects: {},
  
  setObjects: (objects) => set({ objects }),
  addObject: (object) =>
    set((state) => ({
      objects: { 
        ...state.objects, 
        [object.id]: {
          ...object,
          // Auto-generate name if not provided
          name: object.name || generateLayerName(object.type, object.id),
        }
      },
    })),
  updateObject: (objectId, updates) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [objectId]: {
          ...state.objects[objectId],
          ...updates,
        },
      },
    })),
  removeObject: (objectId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [objectId]: _, ...rest } = state.objects;
      return { objects: rest };
    }),
  
  // Layer management actions
  reorderLayer: (draggedId, targetId) =>
    set((state) => {
      const draggedObject = state.objects[draggedId];
      const targetObject = state.objects[targetId];
      
      if (!draggedObject || !targetObject) return state;
      
      // Get all objects sorted by order
      const sortedObjects = Object.values(state.objects).sort((a, b) => a.order - b.order);
      
      // Find indices
      const draggedIndex = sortedObjects.findIndex(obj => obj.id === draggedId);
      const targetIndex = sortedObjects.findIndex(obj => obj.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return state;
      
      // Calculate new order: insert dragged object above target
      // In layers panel (front to back), "above" means higher order value
      const newOrder = targetObject.order + 1;
      
      // Update the dragged object with new order
      return {
        objects: {
          ...state.objects,
          [draggedId]: {
            ...draggedObject,
            order: newOrder,
          },
        },
      };
    }),
  
  toggleLayerVisibility: (id) =>
    set((state) => {
      const object = state.objects[id];
      if (!object) return state;
      
      // Toggle: undefined/true → false, false → true
      const newVisible = object.visible === false ? true : false;
      
      return {
        objects: {
          ...state.objects,
          [id]: {
            ...object,
            visible: newVisible,
          },
        },
      };
    }),
  
  toggleLayerLock: (id) =>
    set((state) => {
      const object = state.objects[id];
      if (!object) return state;
      
      // Toggle: undefined/false → true, true → false
      const newLocked = object.locked === true ? false : true;
      
      return {
        objects: {
          ...state.objects,
          [id]: {
            ...object,
            locked: newLocked,
          },
        },
      };
    }),
}));

