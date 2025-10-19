// Layer types for hierarchical layer system
import type { CanvasObject } from './index';

/**
 * Layer entity - organizational groups containing multiple objects
 */
export interface Layer {
  id: string;
  name: string;
  visible: boolean;      // default: true
  locked: boolean;       // default: false
  createdAt: number;
  updatedAt: number;
}

/**
 * Layer with nested objects (computed structure for UI)
 */
export interface LayerWithObjects {
  layer: Layer;
  objects: CanvasObject[];
  isExpanded: boolean;
}

/**
 * Layer state in store
 */
export interface LayerState {
  layers: Layer[];
  layerExpandedState: Record<string, boolean>; // Local UI state, not synced
}

/**
 * Constants for Default Layer
 */
export const DEFAULT_LAYER_ID = 'default';
export const DEFAULT_LAYER_NAME = 'Default Layer';

