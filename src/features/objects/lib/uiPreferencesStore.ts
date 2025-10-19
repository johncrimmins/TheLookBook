// UI Preferences store - manages user UI preferences (persisted to localStorage)
import { create } from 'zustand';

/**
 * PERSISTENCE STRATEGY FOR UI PREFERENCES
 * 
 * Pattern: User Preferences (Per-Device)
 * - Primary: localStorage for fast, device-specific preferences
 * - Scope: Per-user, per-device (not synced across devices)
 * - Lifecycle: Persists across sessions until manually cleared
 * 
 * This store manages UI state that should persist across page refreshes:
 * - Sidebar open/closed/pinned state
 * - Panel expanded/collapsed state
 */

// LocalStorage keys for user preference persistence
const STORAGE_KEYS = {
  SIDEBAR_OPEN: 'collabcanvas_sidebar_open',
  SIDEBAR_PINNED: 'collabcanvas_sidebar_pinned',
  PROPERTIES_EXPANDED: 'collabcanvas_properties_expanded',
  LAYERS_EXPANDED: 'collabcanvas_layers_expanded',
} as const;

/**
 * Load user preference from localStorage with fallback
 * @param key - Storage key
 * @param defaultValue - Default value if not found or error
 * @returns Stored boolean value or default
 */
const loadFromStorage = (key: string, defaultValue: boolean): boolean => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load from localStorage: ${key}`, error);
    return defaultValue;
  }
};

/**
 * Save user preference to localStorage
 * @param key - Storage key
 * @param value - Boolean value to save
 */
const saveToStorage = (key: string, value: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error);
    // Silently fail if localStorage is unavailable (e.g., private browsing)
  }
};

interface UIPreferencesState {
  // Right sidebar state
  isRightSidebarOpen: boolean;
  isRightSidebarPinned: boolean;
  isPropertiesPanelExpanded: boolean;
  isLayersPanelExpanded: boolean;
  
  // Right sidebar actions
  toggleRightSidebar: () => void;
  toggleRightSidebarPin: () => void;
  togglePropertiesPanel: () => void;
  toggleLayersPanel: () => void;
  setRightSidebarOpen: (open: boolean) => void;
}

export const useUIPreferencesStore = create<UIPreferencesState>((set) => ({
  /**
   * Initialize sidebar state from localStorage (User Preferences)
   * 
   * Strategy:
   * - If pinned + previously open → restore as open
   * - Otherwise → start closed for clean first impression
   * 
   * Defaults:
   * - isRightSidebarOpen: false (closed on first visit)
   * - isRightSidebarPinned: true (pinned by default)
   * - isPropertiesPanelExpanded: true (expanded by default)
   * - isLayersPanelExpanded: true (expanded by default)
   * 
   * On subsequent visits, pinned sidebar state is restored from localStorage.
   */
  isRightSidebarOpen: loadFromStorage(STORAGE_KEYS.SIDEBAR_OPEN, false),
  isRightSidebarPinned: loadFromStorage(STORAGE_KEYS.SIDEBAR_PINNED, true),
  isPropertiesPanelExpanded: loadFromStorage(STORAGE_KEYS.PROPERTIES_EXPANDED, true),
  isLayersPanelExpanded: loadFromStorage(STORAGE_KEYS.LAYERS_EXPANDED, true),
  
  // Right sidebar actions
  toggleRightSidebar: () =>
    set((state) => {
      const newOpen = !state.isRightSidebarOpen;
      // Save open/closed state to localStorage (for pinned sidebar persistence)
      saveToStorage(STORAGE_KEYS.SIDEBAR_OPEN, newOpen);
      return { isRightSidebarOpen: newOpen };
    }),
  toggleRightSidebarPin: () =>
    set((state) => {
      const newPinned = !state.isRightSidebarPinned;
      saveToStorage(STORAGE_KEYS.SIDEBAR_PINNED, newPinned);
      return { isRightSidebarPinned: newPinned };
    }),
  togglePropertiesPanel: () =>
    set((state) => {
      const newExpanded = !state.isPropertiesPanelExpanded;
      saveToStorage(STORAGE_KEYS.PROPERTIES_EXPANDED, newExpanded);
      return { isPropertiesPanelExpanded: newExpanded };
    }),
  toggleLayersPanel: () =>
    set((state) => {
      const newExpanded = !state.isLayersPanelExpanded;
      saveToStorage(STORAGE_KEYS.LAYERS_EXPANDED, newExpanded);
      return { isLayersPanelExpanded: newExpanded };
    }),
  setRightSidebarOpen: (open) => 
    set(() => {
      // Save state when explicitly set (e.g., from "Format Shape" action)
      saveToStorage(STORAGE_KEYS.SIDEBAR_OPEN, open);
      return { isRightSidebarOpen: open };
    }),
}));

