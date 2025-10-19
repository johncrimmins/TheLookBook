// Canvas feature Zustand store
import { create } from 'zustand';
import { Viewport } from '../types';

interface ContextMenuState {
  objectId: string;
  position: { x: number; y: number };
}

interface PropertiesPanelState {
  objectId: string;
}

interface CanvasState {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
  
  // Right-click context menu (small action menu)
  contextMenu: ContextMenuState | null;
  setContextMenu: (menu: ContextMenuState | null) => void;
  
  // Properties panel (side panel for editing)
  propertiesPanel: PropertiesPanelState | null;
  setPropertiesPanel: (panel: PropertiesPanelState | null) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  viewport: {
    x: 0,
    y: 0,
    scale: 1,
  },
  setViewport: (viewport) => set({ viewport }),
  contextMenu: null,
  setContextMenu: (menu) => set({ contextMenu: menu }),
  propertiesPanel: null,
  setPropertiesPanel: (panel) => set({ propertiesPanel: panel }),
}));

