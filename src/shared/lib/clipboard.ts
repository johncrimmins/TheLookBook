// Clipboard utilities for copy/paste functionality
// Uses localStorage for app-specific clipboard (persists across sessions)

import { CanvasObject } from '@/features/objects/types';

const CLIPBOARD_KEY = 'collabcanvas_clipboard';
const CLIPBOARD_VERSION = '1.0';
const CLIPBOARD_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ClipboardData {
  version: string;
  timestamp: number;
  canvasId?: string;
  object: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;
}

/**
 * Copy an object to the clipboard
 * Stores in localStorage for persistence across sessions
 */
export function copyToClipboard(object: CanvasObject, canvasId?: string): boolean {
  try {
    // Create clipboard data structure
    const clipboardData: ClipboardData = {
      version: CLIPBOARD_VERSION,
      timestamp: Date.now(),
      canvasId,
      object: {
        type: object.type,
        position: { ...object.position },
        width: object.width,
        height: object.height,
        rotation: object.rotation,
        fill: object.fill,
        opacity: object.opacity,
      },
    };

    // Serialize and store
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboardData));
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Paste an object from the clipboard
 * Returns clipboard data if valid, null otherwise
 */
export function pasteFromClipboard(): ClipboardData | null {
  try {
    const data = localStorage.getItem(CLIPBOARD_KEY);
    if (!data) return null;

    const clipboardData = JSON.parse(data) as ClipboardData;

    // Validate version
    if (clipboardData.version !== CLIPBOARD_VERSION) {
      console.warn('Clipboard version mismatch');
      return null;
    }

    // Check expiry (24 hours)
    const age = Date.now() - clipboardData.timestamp;
    if (age > CLIPBOARD_EXPIRY_MS) {
      console.warn('Clipboard data expired');
      clearClipboard();
      return null;
    }

    // Validate required properties
    if (!clipboardData.object || !clipboardData.object.type || !clipboardData.object.position) {
      console.warn('Invalid clipboard data structure');
      return null;
    }

    return clipboardData;
  } catch (error) {
    console.error('Failed to paste from clipboard:', error);
    return null;
  }
}

/**
 * Check if clipboard has valid data
 */
export function hasClipboardData(): boolean {
  return pasteFromClipboard() !== null;
}

/**
 * Clear the clipboard
 */
export function clearClipboard(): void {
  try {
    localStorage.removeItem(CLIPBOARD_KEY);
  } catch (error) {
    console.error('Failed to clear clipboard:', error);
  }
}

