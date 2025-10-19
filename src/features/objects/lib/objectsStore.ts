// Objects store - manages canvas objects (domain data only)
import { create } from 'zustand';
import { CanvasObject, Layer, LayerWithObjects, DEFAULT_LAYER_ID, DEFAULT_LAYER_NAME } from '../types';

/**
 * Generate a display name for an object
 * @param type - Object type (rectangle, circle, etc.)
 * @param id - Object ID
 * @returns Auto-generated name like "Rectangle a3f2" or "Circle b7e1"
 */
export const generateObjectName = (type: string, id: string): string => {
  // Defensive check for undefined values
  if (!type || !id) {
    console.warn('generateObjectName called with undefined values:', { type, id });
    return 'Unknown Object';
  }
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  return `${capitalize(type)} ${id.slice(0, 4)}`;
};

/**
 * Generate next layer name (Layer 2, Layer 3, etc.)
 */
const getNextLayerName = (existingLayers: Layer[]): string => {
  // Filter out Default Layer and get numeric layer names
  const layerNumbers = existingLayers
    .filter(l => l.id !== DEFAULT_LAYER_ID)
    .map(l => {
      const match = l.name.match(/^Layer (\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => n > 0);
  
  const maxNumber = layerNumbers.length > 0 ? Math.max(...layerNumbers) : 1;
  return `Layer ${maxNumber + 1}`;
};

interface ObjectsState {
  objects: Record<string, CanvasObject>;
  layers: Layer[];
  layerExpandedState: Record<string, boolean>; // Local UI state (not synced)
  
  // Object CRUD
  setObjects: (objects: Record<string, CanvasObject>) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void;
  removeObject: (objectId: string) => void;
  
  // Layer CRUD
  setLayers: (layers: Layer[]) => void;
  createLayer: (name?: string) => Layer;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  toggleLayerExpanded: (id: string) => void;
  initializeDefaultLayer: () => void;
  
  // Layer queries
  getLayerById: (id: string) => Layer | undefined;
  getObjectsByLayerId: (layerId: string) => CanvasObject[];
  getLayersWithObjects: () => LayerWithObjects[];
  
  // Object-to-layer assignment
  assignObjectsToLayer: (objectIds: string[], layerId: string) => void;
  
  // Legacy layer management (for backward compatibility with flat layers)
  reorderLayer: (draggedId: string, targetId: string) => void;
  toggleLayerVisibility: (id: string) => void;
  toggleLayerLock: (id: string) => void;
}

export const useObjectsStore = create<ObjectsState>((set, get) => ({
  objects: {},
  layers: [],
  layerExpandedState: {},
  
  // ============ Object CRUD ============
  setObjects: (objects) => set({ objects }),
  
  addObject: (object) =>
    set((state) => ({
      objects: { 
        ...state.objects, 
        [object.id]: {
          ...object,
          // Auto-generate name if not provided
          name: object.name || generateObjectName(object.type, object.id),
          // Assign to Default Layer if no layerId
          layerId: object.layerId || DEFAULT_LAYER_ID,
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
  
  // ============ Layer CRUD ============
  setLayers: (layers) => set({ layers }),
  
  createLayer: (name) => {
    const state = get();
    const newLayer: Layer = {
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name || getNextLayerName(state.layers),
      visible: true,
      locked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    set({
      layers: [...state.layers, newLayer],
      layerExpandedState: { ...state.layerExpandedState, [newLayer.id]: true },
    });
    
    // NOTE: Service sync should be handled by caller (useObjects hook)
    // This keeps store pure and allows for optimistic updates
    
    return newLayer;
  },
  
  updateLayer: (id, updates) =>
    set((state) => {
      // Prevent updates to Default Layer name
      if (id === DEFAULT_LAYER_ID && updates.name) {
        console.warn('Cannot rename Default Layer');
        return state;
      }
      
      return {
        layers: state.layers.map(layer =>
          layer.id === id
            ? { ...layer, ...updates, updatedAt: Date.now() }
            : layer
        ),
      };
    }),
  
  deleteLayer: (id) => {
    // Prevent deletion of Default Layer
    if (id === DEFAULT_LAYER_ID) {
      console.warn('Cannot delete Default Layer');
      return;
    }
    
    const state = get();
    
    // Reassign all objects from deleted layer to Default Layer
    const updatedObjects = { ...state.objects };
    Object.keys(updatedObjects).forEach(objId => {
      if (updatedObjects[objId].layerId === id) {
        updatedObjects[objId] = {
          ...updatedObjects[objId],
          layerId: DEFAULT_LAYER_ID,
        };
      }
    });
    
    // Remove layer from array
    set({
      layers: state.layers.filter(layer => layer.id !== id),
      objects: updatedObjects,
    });
  },
  
  toggleLayerExpanded: (id) =>
    set((state) => ({
      layerExpandedState: {
        ...state.layerExpandedState,
        [id]: !state.layerExpandedState[id],
      },
    })),
  
  initializeDefaultLayer: () => {
    const state = get();
    const hasDefaultLayer = state.layers.some(l => l.id === DEFAULT_LAYER_ID);
    
    if (!hasDefaultLayer) {
      const defaultLayer: Layer = {
        id: DEFAULT_LAYER_ID,
        name: DEFAULT_LAYER_NAME,
        visible: true,
        locked: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      set({
        layers: [defaultLayer, ...state.layers],
        layerExpandedState: { ...state.layerExpandedState, [DEFAULT_LAYER_ID]: true },
      });
    }
    
    // Migration: assign objects without layerId to Default Layer
    const updatedObjects = { ...state.objects };
    let hasChanges = false;
    
    Object.keys(updatedObjects).forEach(objId => {
      if (!updatedObjects[objId].layerId) {
        updatedObjects[objId] = {
          ...updatedObjects[objId],
          layerId: DEFAULT_LAYER_ID,
        };
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      set({ objects: updatedObjects });
    }
  },
  
  // ============ Layer Queries ============
  getLayerById: (id) => {
    const state = get();
    return state.layers.find(layer => layer.id === id);
  },
  
  getObjectsByLayerId: (layerId) => {
    const state = get();
    return Object.values(state.objects).filter(obj => obj.layerId === layerId);
  },
  
  getLayersWithObjects: () => {
    const state = get();
    
    // Sort: Default Layer first, then others
    const sortedLayers = [...state.layers].sort((a, b) => {
      if (a.id === DEFAULT_LAYER_ID) return -1;
      if (b.id === DEFAULT_LAYER_ID) return 1;
      return b.createdAt - a.createdAt; // Newest first
    });
    
    return sortedLayers.map(layer => ({
      layer,
      objects: state.getObjectsByLayerId(layer.id),
      isExpanded: state.layerExpandedState[layer.id] ?? true,
    }));
  },
  
  // ============ Object-to-Layer Assignment ============
  assignObjectsToLayer: (objectIds, layerId) => {
    const state = get();
    const updatedObjects = { ...state.objects };
    
    objectIds.forEach(objectId => {
      if (updatedObjects[objectId]) {
        updatedObjects[objectId] = {
          ...updatedObjects[objectId],
          layerId,
        };
      }
    });
    
    set({ objects: updatedObjects });
  },
  
  // ============ Legacy Layer Management (Backward Compatibility) ============
  reorderLayer: (draggedId, targetId) =>
    set((state) => {
      const draggedObject = state.objects[draggedId];
      const targetObject = state.objects[targetId];
      
      if (!draggedObject || !targetObject) return state;
      
      const newOrder = targetObject.order + 1;
      
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

